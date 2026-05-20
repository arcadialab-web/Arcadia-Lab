import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe   = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { event_id, nome, cognome, email, telefono, user_id } = await req.json();

    if (!event_id || !nome || !email) {
      return new Response(JSON.stringify({ error: 'Dati mancanti' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const emailNorm = email.toLowerCase().trim();
    const appUrl   = Deno.env.get('APP_URL') ?? 'https://www.arcadialab.it';

    // 1. Leggi l'evento
    const { data: evento, error: evErr } = await supabase
      .from('special_events')
      .select('*')
      .eq('id', event_id)
      .eq('is_attivo', true)
      .single();

    if (evErr || !evento) {
      return new Response(JSON.stringify({ error: 'Evento non trovato' }), {
        status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // 2. Controlla se l'utente ha un abbonamento attivo
    let isAbbonato = false;
    if (user_id) {
      const { count } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user_id)
        .eq('stato', 'attivo');
      isAbbonato = (count ?? 0) > 0;
    }

    // 3. Calcola il prezzo
    const prezzoBase  = parseFloat(evento.prezzo_base) || 0;
    const prezzoExtra = isAbbonato ? 0 : (parseFloat(evento.prezzo_extra_non_abbonato) || 0);
    const prezzoTot   = prezzoBase + prezzoExtra;
    const centesimi   = Math.round(prezzoTot * 100);

    // 4. Crea la sessione Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_creation: 'always',
      customer_email: emailNorm,
      locale: 'it',
      line_items: centesimi > 0 ? [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: centesimi,
          product_data: {
            name: `Biglietto — ${evento.titolo}`,
            description: evento.data_evento
              ? new Date(evento.data_evento).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : undefined,
          },
        },
      }] : [],
      metadata: {
        type:        'event',
        event_id:    evento.id,
        event_titolo: evento.titolo,
        nome:        nome,
        cognome:     cognome ?? '',
        email:       emailNorm,
        telefono:    telefono ?? '',
        user_id:     user_id ?? '',
        is_abbonato: isAbbonato.toString(),
        prezzo_pagato: prezzoTot.toFixed(2),
      },
      // Se il prezzo è 0 usiamo submit_type differently
      ...(centesimi === 0 ? { submit_type: 'book' } : {}),
      success_url: `${appUrl}/evento-ok?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/#workshops`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Errore create-event-checkout:', err);
    return new Response(JSON.stringify({ error: 'Errore interno' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
