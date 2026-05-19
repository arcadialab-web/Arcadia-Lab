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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { plan_id } = await req.json();

    if (!plan_id) {
      return new Response(JSON.stringify({ error: 'plan_id mancante' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Leggi il piano dal database
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

    const appUrl = Deno.env.get('APP_URL') ?? 'https://arcadialab.it';

    // Crea Checkout Session Stripe con prezzo dinamico (price_data)
    // Nessun prodotto da creare su Stripe — il prezzo viene dall'admin
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_creation: 'always',  // crea sempre un customer per poter recuperare l'email
      billing_address_collection: 'auto',
      locale: 'it',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(plan.prezzo * 100), // Stripe usa centesimi
            product_data: {
              name: plan.nome,
              description: plan.descrizione ?? undefined,
              metadata: {
                plan_id: plan.id,
                lezioni_totali: plan.lezioni_totali.toString(),
                durata_giorni: plan.durata_giorni.toString(),
              },
            },
          },
        },
      ],
      // Passa plan_id nei metadata della session
      metadata: {
        plan_id: plan.id,
        plan_nome: plan.nome,
        lezioni_totali: plan.lezioni_totali.toString(),
        durata_giorni: plan.durata_giorni.toString(),
      },
      // Stripe chiede l'email → verrà usata per creare l'account Supabase
      success_url: `${appUrl}/pagamento-ok?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#pricing`,
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
