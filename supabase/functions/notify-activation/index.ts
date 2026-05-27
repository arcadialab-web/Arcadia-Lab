import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAILS = ['ai.danielcorso@gmail.com', 'arcadialabyoga@gmail.com'];

async function verifyAdmin(req: Request): Promise<boolean> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  const { data: { user } } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
  if (!user) return false;
  if (ADMIN_EMAILS.includes(user.email ?? '')) return true;
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return p?.role === 'admin';
}

async function sendEmail(to: string, subject: string, html: string) {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Arcadia Lab. <noreply@arcadialab.it>', to: [to], subject, html }),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  if (!await verifyAdmin(req)) {
    return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
      status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const { email, nome, planNome, dataScadenza } = await req.json();
  if (!email) return new Response(JSON.stringify({ error: 'email mancante' }), {
    status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
  });

  const siteUrl = Deno.env.get('SITE_URL') ?? 'https://www.arcadialab.it';
  const nomeDisplay = nome || email.split('@')[0];
  const scadFmt = dataScadenza
    ? new Date(dataScadenza).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const html = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#fdfbf7;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf7;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <tr><td style="background:#2b2927;padding:36px 48px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.5);font-family:sans-serif;">Arcadia Lab. Yoga</p>
    <h1 style="margin:10px 0 0;font-size:28px;color:#fff;font-weight:400;font-style:italic;">Abbonamento attivato! 🧘</h1>
  </td></tr>
  <tr><td style="padding:36px 48px;">
    <p style="margin:0 0 20px;font-size:15px;color:#2b2927;line-height:1.7;font-family:sans-serif;">
      Ciao <strong>${nomeDisplay}</strong>,<br/>
      abbiamo ricevuto e verificato il tuo certificato medico. Il tuo abbonamento è ora <strong>attivo</strong> e puoi iniziare a prenotare le lezioni.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e8;border-radius:16px;margin-bottom:24px;">
      <tr><td style="padding:18px 24px;">
        <p style="margin:0 0 4px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#5a544c;font-family:sans-serif;">Piano attivo</p>
        <p style="margin:0;font-size:17px;color:#2b2927;font-weight:700;font-family:sans-serif;">${planNome ?? 'Abbonamento'}</p>
        ${scadFmt ? `<p style="margin:6px 0 0;font-size:13px;color:#5a544c;font-family:sans-serif;">Scadenza: ${scadFmt}</p>` : ''}
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center">
      <a href="${siteUrl}/dashboard" style="display:inline-block;background:#b56a56;color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;font-family:sans-serif;">Prenota la tua prima lezione</a>
    </td></tr></table>
    <p style="margin:0;font-size:13px;color:#5a544c;font-family:sans-serif;">Dubbi? <a href="mailto:arcadialabyoga@gmail.com" style="color:#b56a56;">arcadialabyoga@gmail.com</a></p>
  </td></tr>
  <tr><td style="background:#f5f1e8;padding:20px 48px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#a39c90;font-family:sans-serif;font-style:italic;">Arcadia Lab. Yoga · <a href="${siteUrl}" style="color:#b56a56;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, '')}</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  await sendEmail(email, 'Arcadia Lab. — Il tuo abbonamento è attivo 🧘', html);

  // Notifica admin
  await sendEmail(
    'arcadialabyoga@gmail.com',
    `[Arcadia Lab.] Abbonamento attivato: ${nomeDisplay}`,
    `<p style="font-family:sans-serif;font-size:15px;">
      Hai sbloccato l'abbonamento di <strong>${nomeDisplay}</strong> (${email}).<br/>
      Piano: <strong>${planNome ?? '—'}</strong>${scadFmt ? `<br/>Scadenza: ${scadFmt}` : ''}
    </p>`,
  );

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
