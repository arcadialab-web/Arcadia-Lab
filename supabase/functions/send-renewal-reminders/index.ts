import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmail(to: string, subject: string, html: string) {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) return;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Arcadia Lab. <noreply@arcadialab.it>', to: [to], subject, html }),
  });
  if (!res.ok) console.error('Errore Resend:', await res.text());
}

function buildReminderHtml(opts: {
  nome: string; dataScadenza: string; giorniRimasti: number;
  siteUrl: string; tipo: 'abbonamento' | 'tessera'; planNome?: string;
}): string {
  const { nome, dataScadenza, giorniRimasti, siteUrl, tipo, planNome } = opts;
  const urgente = giorniRimasti <= 3;
  const coloreAvviso = urgente ? '#c0392b' : '#b56a56';

  const titolo = tipo === 'tessera'
    ? 'La tua tessera sta per scadere'
    : 'Il tuo abbonamento sta per scadere';

  const messaggio = tipo === 'tessera'
    ? `La tua <strong>tessera associativa annuale</strong> scade tra <strong>${giorniRimasti} giorni</strong> (il ${dataScadenza}). Senza tessera valida non potrai prenotare le lezioni — rinnova l'abbonamento per rinnovarla automaticamente.`
    : (urgente
        ? `Il tuo abbonamento <strong>${planNome}</strong> scade tra <strong>${giorniRimasti} giorni</strong>. Rinnova subito per non interrompere le tue lezioni.`
        : `Il tuo abbonamento <strong>${planNome}</strong> scade tra <strong>${giorniRimasti} giorni</strong> (il ${dataScadenza}). Puoi rinnovarlo dalla tua area personale.`);

  const labelScatola = tipo === 'tessera' ? 'Scadenza Tessera' : 'Scadenza Abbonamento';
  const sottoLabel   = tipo === 'tessera' ? 'Tessera Associativa Annuale' : (planNome ?? '');

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#fdfbf7;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf7;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <tr><td style="background:#2b2927;padding:32px 48px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.5);font-family:sans-serif;">Arcadia Lab. Yoga</p>
    <h1 style="margin:10px 0 0;font-size:24px;color:#fff;font-weight:400;font-style:italic;">${titolo}</h1>
  </td></tr>
  <tr><td style="padding:36px 48px;">
    <p style="margin:0 0 20px;font-size:15px;color:#2b2927;line-height:1.8;font-family:sans-serif;">
      Ciao <strong>${nome}</strong>,<br/>${messaggio}
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border:2px solid ${coloreAvviso};border-radius:16px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#5a544c;font-family:sans-serif;">${labelScatola}</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:${coloreAvviso};font-family:sans-serif;">${dataScadenza}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#5a544c;font-family:sans-serif;">${sottoLabel}</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td align="center">
        <a href="${siteUrl}/dashboard" style="display:inline-block;background:#b56a56;color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;font-family:sans-serif;">
          Rinnova ora
        </a>
      </td></tr>
    </table>
    <p style="margin:0;font-size:13px;color:#5a544c;font-family:sans-serif;">
      Per qualsiasi domanda: <a href="mailto:arcadialabyoga@gmail.com" style="color:#b56a56;">arcadialabyoga@gmail.com</a>
    </p>
  </td></tr>
  <tr><td style="background:#f5f1e8;padding:20px 48px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#a39c90;font-family:sans-serif;font-style:italic;">
      Arcadia Lab. Yoga · <a href="${siteUrl}" style="color:#b56a56;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, '')}</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const siteUrl = Deno.env.get('SITE_URL') ?? 'https://www.arcadialab.it';

  let targetDays: number[] = [7, 3];
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      if (body.giorni) targetDays = [parseInt(body.giorni)];
    } catch { /* body vuoto, usa default */ }
  }

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  let totalSent = 0;
  const results: { tipo: string; giorni: number; sent: number }[] = [];

  // ── Reminder abbonamenti ──────────────────────────────────────
  for (const giorni of targetDays) {
    const target = new Date(oggi);
    target.setDate(target.getDate() + giorni);
    const targetStr = target.toISOString().split('T')[0];

    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('user_id, plan_id, data_scadenza, profiles(email, nome, cognome)')
      .eq('stato', 'attivo')
      .eq('data_scadenza', targetStr);

    if (error) { console.error(`Errore abbonamenti ${giorni}gg:`, error.message); continue; }

    let sent = 0;
    for (const sub of subs ?? []) {
      const profile = (sub as any).profiles;
      if (!profile?.email) continue;

      const nome = [profile.nome, profile.cognome].filter(Boolean).join(' ') || profile.email.split('@')[0];
      const dataScadenzaFmt = new Date(sub.data_scadenza).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
      const { data: plan } = await supabase.from('plans').select('nome').eq('id', sub.plan_id).single();
      const planNome = plan?.nome ?? 'Abbonamento';

      const html = buildReminderHtml({ nome, planNome, dataScadenza: dataScadenzaFmt, giorniRimasti: giorni, siteUrl, tipo: 'abbonamento' });
      const subject = giorni <= 3
        ? `Arcadia Lab. — Il tuo abbonamento scade tra ${giorni} giorni ⚠️`
        : `Arcadia Lab. — Reminder: abbonamento in scadenza tra ${giorni} giorni`;

      await sendEmail(profile.email, subject, html);
      sent++;
    }

    results.push({ tipo: 'abbonamento', giorni, sent });
    totalSent += sent;
    console.log(`✅ Reminder abbonamento ${giorni}gg: ${sent} email`);
  }

  // ── Reminder tessera ──────────────────────────────────────────
  for (const giorni of targetDays) {
    const target = new Date(oggi);
    target.setDate(target.getDate() + giorni);
    const targetStr = target.toISOString().split('T')[0];

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('email, nome, cognome, tessera_scadenza')
      .eq('tessera_scadenza', targetStr);

    if (error) { console.error(`Errore tessera ${giorni}gg:`, error.message); continue; }

    let sent = 0;
    for (const profile of profiles ?? []) {
      if (!profile.email) continue;

      const nome = [profile.nome, profile.cognome].filter(Boolean).join(' ') || profile.email.split('@')[0];
      const dataScadenzaFmt = new Date(profile.tessera_scadenza).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

      const html = buildReminderHtml({ nome, dataScadenza: dataScadenzaFmt, giorniRimasti: giorni, siteUrl, tipo: 'tessera' });
      const subject = giorni <= 3
        ? `Arcadia Lab. — La tua tessera scade tra ${giorni} giorni ⚠️`
        : `Arcadia Lab. — Reminder: tessera associativa in scadenza tra ${giorni} giorni`;

      await sendEmail(profile.email, subject, html);
      sent++;
    }

    results.push({ tipo: 'tessera', giorni, sent });
    totalSent += sent;
    console.log(`✅ Reminder tessera ${giorni}gg: ${sent} email`);
  }

  // ── Sospendi abbonamenti con certificato scaduto ─────────────
  const oggiStr = oggi.toISOString().split('T')[0];
  const { data: certScaduti } = await supabase
    .from('profiles')
    .select('id')
    .lt('cert_medico_scadenza', oggiStr)
    .eq('prenotazioni_sbloccate', true);

  for (const prof of certScaduti ?? []) {
    // Blocca le prenotazioni
    await supabase.from('profiles').update({
      prenotazioni_sbloccate: false,
    }).eq('id', prof.id);

    // Sospendi abbonamento attivo e salva paused_at
    await supabase.from('subscriptions').update({
      stato:     'sospeso',
      paused_at: oggiStr,
    }).eq('user_id', prof.id).eq('stato', 'attivo');
  }
  console.log(`✅ Certificati scaduti: ${certScaduti?.length ?? 0} utenti bloccati`);

  return new Response(JSON.stringify({ sent: totalSent, details: results, cert_sospesi: certScaduti?.length ?? 0 }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
