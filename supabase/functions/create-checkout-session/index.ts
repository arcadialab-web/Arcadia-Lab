import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

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
    const { plan_id, email } = await req.json();

    if (!plan_id || !email) {
      return new Response(JSON.stringify({ error: 'plan_id ed email sono obbligatori' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // 2. Controlla se l'utente esiste già
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === email.toLowerCase()
    );

    const isNewUser = !existingUser;

    // 3. Controlla se l'utente esistente ha già una tessera valida
    let hasTesseraValida = false;
    if (!isNewUser && existingUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tessera_scadenza')
        .eq('id', existingUser.id)
        .single();

      if (profile?.tessera_scadenza) {
        hasTesseraValida = new Date(profile.tessera_scadenza) > new Date();
      }
    }

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

    // Aggiungi tessera se necessario
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

    // 5. Crea la Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_creation: 'always',
      customer_email: email,   // pre-compila l'email su Stripe
      billing_address_collection: 'auto',
      locale: 'it',
      line_items: lineItems,
      metadata: {
        plan_id:        plan.id,
        plan_nome:      plan.nome,
        lezioni_totali: plan.lezioni_totali.toString(),
        durata_giorni:  plan.durata_giorni.toString(),
        is_new_user:    isNewUser.toString(),
        aggiunge_tessera: aggiungeTessera.toString(),
        customer_email: email,
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
