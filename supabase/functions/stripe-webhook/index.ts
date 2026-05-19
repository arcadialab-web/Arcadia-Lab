import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

// Service role: necessario per creare utenti e scrivere senza RLS
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    console.error('Firma webhook non valida:', err);
    return new Response('Firma non valida', { status: 400 });
  }

  // ── Gestisci solo il pagamento completato ──
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_details?.email;
    const planId        = session.metadata?.plan_id;
    const lezioni       = parseInt(session.metadata?.lezioni_totali ?? '0');
    const durata        = parseInt(session.metadata?.durata_giorni ?? '30');
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;

    if (!customerEmail || !planId) {
      console.error('Dati mancanti nella session:', { customerEmail, planId });
      return new Response('Dati mancanti', { status: 400 });
    }

    try {
      // 1. Cerca se l'utente esiste già in Supabase
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === customerEmail);

      let userId: string;

      if (existingUser) {
        // Utente già registrato → aggiorna solo l'abbonamento
        userId = existingUser.id;
        console.log('Utente esistente:', userId);
      } else {
        // Utente nuovo → crea account Supabase
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: customerEmail,
          email_confirm: true,  // conferma email automaticamente
          user_metadata: { stripe_customer_id: stripeCustomerId },
        });

        if (createError || !newUser.user) {
          console.error('Errore creazione utente:', createError);
          return new Response('Errore creazione utente', { status: 500 });
        }

        userId = newUser.user.id;
        console.log('Nuovo utente creato:', userId);

        // Aggiorna profilo con stripe_customer_id
        await supabase.from('profiles')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', userId);

        // Invia email con link per impostare la password
        await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: customerEmail,
          options: {
            redirectTo: `${Deno.env.get('APP_URL')}/auth`,
          },
        });
        // Nota: Supabase invia automaticamente l'email di recovery
        // L'utente cliccherà il link e imposterà la sua password
      }

      // 2. Calcola la data di scadenza
      const dataInizio   = new Date();
      const dataScadenza = new Date();
      dataScadenza.setDate(dataScadenza.getDate() + durata);

      // 3. Disattiva eventuali abbonamenti attivi precedenti dello stesso utente
      await supabase.from('subscriptions')
        .update({ stato: 'scaduto' })
        .eq('user_id', userId)
        .eq('stato', 'attivo');

      // 4. Crea il nuovo abbonamento
      const { error: subError } = await supabase.from('subscriptions').insert({
        user_id:           userId,
        plan_id:           planId,
        lezioni_totali:    lezioni,
        lezioni_usate:     0,
        data_inizio:       dataInizio.toISOString().split('T')[0],
        data_scadenza:     dataScadenza.toISOString().split('T')[0],
        stato:             'attivo',
        prezzo_pagato:     session.amount_total ? session.amount_total / 100 : null,
        stripe_payment_id: session.payment_intent as string ?? null,
        stripe_customer_id: stripeCustomerId,
      });

      if (subError) {
        console.error('Errore creazione abbonamento:', subError);
        return new Response('Errore creazione abbonamento', { status: 500 });
      }

      console.log(`✅ Abbonamento creato per ${customerEmail} — piano ${planId}`);
    } catch (err) {
      console.error('Errore gestione webhook:', err);
      return new Response('Errore interno', { status: 500 });
    }
  }

  // Rispondi 200 a Stripe per tutti gli altri eventi
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
