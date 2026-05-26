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
    const { plan_id, email, nome, cognome, telefono, renewal_from, include_tessera, tessera_only } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'email è obbligatoria' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!tessera_only && !plan_id) {
      return new Response(JSON.stringify({ error: 'plan_id è obbligatorio' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailNorm = email.toLowerCase().trim();
    const appUrl = Deno.env.get('SITE_URL') ?? 'https://www.arcadialab.it';

    // ── Modalità tessera standalone ──────────────────────────────
    if (tessera_only) {
      const existing = await stripe.customers.list({ email: emailNorm, limit: 1 });
      const customer = existing.data[0]
        ? await stripe.customers.update(existing.data[0].id, {})
        : await stripe.customers.create({ email: emailNorm });

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer: customer.id,
        locale: 'it',
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: TESSERA_PREZZO,
            product_data: {
              name: 'Tessera Associativa Annuale',
              description: 'Rinnovo tessera. Valida 365 giorni dall\'acquisto.',
            },
          },
        }],
        metadata: { type: 'tessera_renewal', customer_email: emailNorm },
        success_url: `${appUrl}/dashboard`,
        cancel_url:  `${appUrl}/dashboard`,
      });

      return new Response(JSON.stringify({ url: session.url }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

    // 2. Cerca utente tramite profiles.email (evita listUsers())
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tessera_scadenza')
      .eq('email', emailNorm)
      .maybeSingle();

    // Se l'email è già registrata blocca il checkout — deve fare login
    if (profile) {
      return new Response(JSON.stringify({ error: 'email_exists' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isNewUser = !profile;

    // 3. Controlla se ha già una tessera valida
    const hasTesseraValida = profile?.tessera_scadenza
      ? new Date(profile.tessera_scadenza) > new Date()
      : false;

    // Se include_tessera è passato esplicitamente dal frontend lo rispettiamo,
    // altrimenti lo aggiungiamo solo se obbligatorio (nuovo utente o tessera scaduta)
    const aggiungeTessera = include_tessera !== undefined
      ? include_tessera
      : (isNewUser || !hasTesseraValida);

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
        renewal_from:     renewal_from ?? '',
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
