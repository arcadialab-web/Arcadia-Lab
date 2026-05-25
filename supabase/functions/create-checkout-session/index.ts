import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TESSERA_PREZZO = 2000; // € 20.00 in centesimi

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { plan_id, email, nome, cognome, telefono } = await req.json();

    if (!plan_id || !email) {
      return new Response(JSON.stringify({ error: 'plan_id ed email sono obbligatori' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailNorm = email.toLowerCase().trim();

    // 1. Leggi il piano
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_attivo', true)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: 'Piano non trovato o non attivo' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Cerca utente tramite profiles.email (evita listUsers())
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tessera_scadenza')
      .eq('email', emailNorm)
      .maybeSingle();

    const isNewUser = !profile;

    // 3. Controlla se ha già una tessera valida
    const hasTesseraValida = profile?.tessera_scadenza
      ? new Date(profile.tessera_scadenza) > new Date()
      : false;

    const aggiungeTessera = isNewUser || !hasTesseraValida;

    const appUrl = Deno.env.get('APP_URL') ?? 'https://www.arcadialab.it';

    // 4. Costruisci i line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(plan.prezzo * 100),
          product_data: {
            name: plan.nome,
            description: plan.descrizione ?? undefined,
          },
        },
      },
    ];

    if (aggiungeTessera) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: TESSERA_PREZZO,
          product_data: {
            name: 'Tessera Associativa Annuale',
            description: 'Obbligatoria per l\'iscrizione. Include copertura assicurativa. Valida 365 giorni.',
          },
        },
      });
    }

    // 5. Crea o aggiorna customer Stripe con nome completo
    //    così il checkout Stripe pre-compila email + nome
    const nomeCompleto = [nome, cognome].filter(Boolean).join(' ').trim();

    let stripeCustomerId: string | undefined;

    // Cerca customer esistente per email
    const existing = await stripe.customers.list({ email: emailNorm, limit: 1 });
    if (existing.data.length > 0) {
      const updated = await stripe.customers.update(existing.data[0].id, {
        name:  nomeCompleto || undefined,
        phone: telefono || undefined,
      });
      stripeCustomerId = updated.id;
    } else {
      const created = await stripe.customers.create({
        email: emailNorm,
        name:  nomeCompleto || undefined,
        phone: telefono || undefined,
      });
      stripeCustomerId = created.id;
    }

    // 6. Crea Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      billing_address_collection: 'required',
      locale: 'it',
      line_items: lineItems,
      metadata: {
        plan_id:          plan.id,
        plan_nome:        plan.nome,
        lezioni_totali:   plan.lezioni_totali.toString(),
        durata_giorni:    plan.durata_giorni.toString(),
        is_new_user:      isNewUser.toString(),
        aggiunge_tessera: aggiungeTessera.toString(),
        customer_email:   emailNorm,
        nome:             nome ?? '',
        cognome:          cognome ?? '',
        telefono:         telefono ?? '',
      },
      success_url: `${appUrl}/pagamento-ok?nuovo=${isNewUser ? '1' : '0'}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/#pricing`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Errore create-checkout-session:', err);
    return new Response(JSON.stringify({ error: 'Errore interno del server' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
