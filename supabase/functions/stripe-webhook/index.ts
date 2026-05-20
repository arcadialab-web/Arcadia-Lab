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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// ── Template email HTML ───────────────────────────────────────
function buildWelcomeEmail(opts: {
  email: string;
  planNome: string;
  resetLink: string;
  isNewUser: boolean;
  aggiungeTessera: boolean;
  tesseraScadenza: string;
}): string {
  const { email, planNome, resetLink, isNewUser, aggiungeTessera, tesseraScadenza } = opts;

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Benvenuta/o in Arcadia Lab.</title>
</head>
<body style="margin:0;padding:0;background:#fdfbf7;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf7;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:#2b2927;padding:40px 48px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.5);font-family:sans-serif;">Arcadia Lab. Yoga</p>
            <h1 style="margin:12px 0 0;font-size:32px;color:#ffffff;font-weight:400;font-style:italic;">
              ${isNewUser ? 'Benvenuta/o!' : 'Abbonamento attivato!'}
            </h1>
          </td>
        </tr>

        <!-- Corpo -->
        <tr>
          <td style="padding:40px 48px;">

            <p style="margin:0 0 16px;font-size:15px;color:#5a544c;line-height:1.7;font-family:sans-serif;">
              Ciao,
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#2b2927;line-height:1.7;font-family:sans-serif;">
              ${isNewUser
                ? `Grazie per aver scelto <strong>Arcadia Lab.</strong> — siamo felici di averti con noi.<br/><br/>
                   Abbiamo creato il tuo account personale con questo indirizzo email: <strong>${email}</strong>`
                : `Grazie per aver rinnovato il tuo abbonamento con <strong>Arcadia Lab.</strong><br/><br/>
                   Il tuo piano <strong>${planNome}</strong> è ora attivo.`
              }
            </p>

            <!-- Box piano -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e8;border-radius:16px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#5a544c;font-family:sans-serif;">Piano acquistato</p>
                  <p style="margin:0;font-size:18px;color:#2b2927;font-weight:700;font-family:sans-serif;">${planNome}</p>
                  ${aggiungeTessera ? `
                  <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#b56a56;font-family:sans-serif;">
                    🎫 Tessera associativa inclusa — valida fino al ${tesseraScadenza}
                  </p>` : ''}
                </td>
              </tr>
            </table>

            <!-- CTA principale (solo nuovi utenti) -->
            ${isNewUser ? `
            <p style="margin:0 0 16px;font-size:15px;color:#2b2927;line-height:1.7;font-family:sans-serif;">
              Clicca il pulsante qui sotto per <strong>impostare la tua password</strong> e accedere al tuo spazio personale:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="${resetLink}"
                     style="display:inline-block;background:#b56a56;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:14px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-family:sans-serif;">
                    Imposta la tua password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 24px;font-size:13px;color:#5a544c;line-height:1.6;font-family:sans-serif;">
              Se il pulsante non funziona, copia e incolla questo link nel browser:<br/>
              <a href="${resetLink}" style="color:#b56a56;word-break:break-all;">${resetLink}</a>
            </p>
            ` : `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="https://www.arcadialab.it/auth"
                     style="display:inline-block;background:#b56a56;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:14px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-family:sans-serif;">
                    Accedi alla tua area personale
                  </a>
                </td>
              </tr>
            </table>
            `}

            <!-- Nota spam -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border:1px solid #f0d4c4;border-radius:12px;margin-bottom:32px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:13px;color:#5a544c;line-height:1.6;font-family:sans-serif;">
                    <strong style="color:#b56a56;">📧 Non trovi l'email?</strong><br/>
                    Controlla le cartelle <strong>Spam</strong>, <strong>Promozioni</strong> o <strong>Posta indesiderata</strong>.
                    Aggiungi <em>arcadialabyoga@gmail.com</em> ai tuoi contatti per ricevere le prossime comunicazioni correttamente.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:14px;color:#5a544c;line-height:1.7;font-family:sans-serif;">
              Per qualsiasi dubbio siamo a tua disposizione:<br/>
              <a href="mailto:arcadialabyoga@gmail.com" style="color:#b56a56;">arcadialabyoga@gmail.com</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f1e8;padding:24px 48px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a39c90;font-family:sans-serif;font-style:italic;">
              Arcadia Lab. Yoga · Respira dove l'anima trova casa.
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#a39c90;font-family:sans-serif;">
              <a href="https://www.arcadialab.it" style="color:#b56a56;text-decoration:none;">www.arcadialab.it</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Invia email via Resend ────────────────────────────────────
async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) {
    console.warn('RESEND_API_KEY non configurata — email non inviata');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    'Arcadia Lab. <noreply@arcadialab.it>',
      to:      [opts.to],
      subject: opts.subject,
      html:    opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Errore Resend:', body);
  } else {
    console.log('✉️ Email inviata a', opts.to);
  }
}

// ── Webhook handler ───────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature   = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
  const body        = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    console.error('Firma webhook non valida:', err);
    return new Response('Firma non valida', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail   = session.customer_details?.email ?? session.metadata?.customer_email;
    const planId          = session.metadata?.plan_id;
    const lezioni         = parseInt(session.metadata?.lezioni_totali ?? '0');
    const durata          = parseInt(session.metadata?.durata_giorni  ?? '30');
    const isNewUser       = session.metadata?.is_new_user === 'true';
    const aggiungeTessera = session.metadata?.aggiunge_tessera === 'true';
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;
    const planNome        = session.metadata?.plan_nome ?? 'Abbonamento';

    if (!customerEmail || !planId) {
      console.error('Dati mancanti:', { customerEmail, planId });
      return new Response('Dati mancanti', { status: 400 });
    }

    try {
      let userId: string;
      let resetLink = 'https://www.arcadialab.it/auth';

      if (isNewUser) {
        // Crea account Supabase
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: customerEmail,
          email_confirm: true,
          user_metadata: { stripe_customer_id: stripeCustomerId },
        });

        if (createError || !newUser.user) {
          console.error('Errore creazione utente:', createError);
          return new Response('Errore creazione utente', { status: 500 });
        }

        userId = newUser.user.id;

        // Aggiorna profilo
        await supabase.from('profiles')
          .update({ stripe_customer_id: stripeCustomerId, email: customerEmail })
          .eq('id', userId);

        // Genera link per impostare la password (scade dopo 24h)
        const { data: linkData } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: customerEmail,
          options: { redirectTo: 'https://www.arcadialab.it/auth' },
        });
        if (linkData?.properties?.action_link) {
          resetLink = linkData.properties.action_link;
        }

      } else {
        // Utente esistente
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(
          u => u.email?.toLowerCase() === customerEmail.toLowerCase()
        );
        if (!existingUser) {
          console.error('Utente esistente non trovato:', customerEmail);
          return new Response('Utente non trovato', { status: 404 });
        }
        userId = existingUser.id;
      }

      // Tessera annuale
      const oggi = new Date();
      if (aggiungeTessera) {
        const tesseraScadenza = new Date(oggi);
        tesseraScadenza.setDate(tesseraScadenza.getDate() + 365);
        await supabase.from('profiles')
          .update({ tessera_scadenza: tesseraScadenza.toISOString().split('T')[0] })
          .eq('id', userId);
      }

      // Data scadenza tessera formattata per email
      const { data: profilo } = await supabase
        .from('profiles')
        .select('tessera_scadenza')
        .eq('id', userId)
        .single();

      const tesseraScadenzaStr = profilo?.tessera_scadenza
        ? new Date(profilo.tessera_scadenza).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

      // Disattiva abbonamenti precedenti
      await supabase.from('subscriptions')
        .update({ stato: 'scaduto' })
        .eq('user_id', userId)
        .eq('stato', 'attivo');

      // Crea nuovo abbonamento
      const dataScadenza = new Date(oggi);
      dataScadenza.setDate(dataScadenza.getDate() + durata);

      const { error: subError } = await supabase.from('subscriptions').insert({
        user_id:            userId,
        plan_id:            planId,
        lezioni_totali:     lezioni,
        lezioni_usate:      0,
        data_inizio:        oggi.toISOString().split('T')[0],
        data_scadenza:      dataScadenza.toISOString().split('T')[0],
        stato:              'attivo',
        prezzo_pagato:      session.amount_total ? session.amount_total / 100 : null,
        stripe_payment_id:  session.payment_intent as string ?? null,
        stripe_customer_id: stripeCustomerId,
      });

      if (subError) {
        console.error('Errore abbonamento:', subError);
        return new Response('Errore creazione abbonamento', { status: 500 });
      }

      // Invia email via Resend
      const emailHtml = buildWelcomeEmail({
        email:           customerEmail,
        planNome,
        resetLink,
        isNewUser,
        aggiungeTessera,
        tesseraScadenza: tesseraScadenzaStr,
      });

      await sendEmail({
        to:      customerEmail,
        subject: isNewUser
          ? `Benvenuta/o in Arcadia Lab. — Il tuo account è pronto 🧘`
          : `Arcadia Lab. — Il tuo abbonamento "${planNome}" è attivo`,
        html: emailHtml,
      });

      console.log(`✅ Completato per ${customerEmail} — piano ${planId} — nuovo: ${isNewUser}`);

    } catch (err) {
      console.error('Errore gestione webhook:', err);
      return new Response('Errore interno', { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
