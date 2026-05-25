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
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Arcadia Lab. <noreply@arcadialab.it>', to: [to], subject, html }),
  });
}

function buildHtml(subject: string, body: string, ctaUrl?: string, ctaLabel?: string): string {
  const ctaBlock = ctaUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td align="center">
        <a href="${ctaUrl}" style="display:inline-block;background:#b56a56;color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;font-family:sans-serif;">
          ${ctaLabel ?? 'Scopri di più'}
        </a>
      </td></tr>
    </table>` : '';

  // Converte newline in <br> per il corpo
  const bodyHtml = body.replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#fdfbf7;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf7;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <tr><td style="background:#2b2927;padding:32px 48px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.5);font-family:sans-serif;">Arcadia Lab. Yoga</p>
    <h1 style="margin:10px 0 0;font-size:26px;color:#fff;font-weight:400;font-style:italic;">${subject}</h1>
  </td></tr>
  <tr><td style="padding:36px 48px;">
    <p style="margin:0 0 20px;font-size:15px;color:#2b2927;line-height:1.8;font-family:sans-serif;">${bodyHtml}</p>
    ${ctaBlock}
    <p style="margin:24px 0 0;font-size:13px;color:#5a544c;font-family:sans-serif;">
      Per qualsiasi domanda: <a href="mailto:arcadialabyoga@gmail.com" style="color:#b56a56;">arcadialabyoga@gmail.com</a>
    </p>
  </td></tr>
  <tr><td style="background:#f5f1e8;padding:20px 48px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#a39c90;font-family:sans-serif;font-style:italic;">
      Arcadia Lab. Yoga · <a href="https://www.arcadialab.it" style="color:#b56a56;text-decoration:none;">www.arcadialab.it</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const {
      subject,
      body,
      filter,        // 'tutti' | 'attivi' | 'scaduti' | 'nessun_sub' | 'ids'
      user_ids,      // string[] — usato quando filter === 'ids'
      cta_url,
      cta_label,
    } = await req.json();

    if (!subject || !body || !filter) {
      return new Response(JSON.stringify({ error: 'subject, body e filter sono obbligatori' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Recupera destinatari ──────────────────────────────────
    let emails: string[] = [];

    if (filter === 'ids' && Array.isArray(user_ids) && user_ids.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('email')
        .in('id', user_ids);
      emails = (data ?? []).map(p => p.email).filter(Boolean);

    } else if (filter === 'attivi') {
      const { data } = await supabase
        .from('subscriptions')
        .select('profiles(email)')
        .eq('stato', 'attivo');
      emails = (data ?? []).map((s: any) => s.profiles?.email).filter(Boolean);
      emails = [...new Set(emails)];

    } else if (filter === 'scaduti') {
      // Ha avuto almeno un abbonamento ma nessuno attivo
      const { data: allSubs } = await supabase
        .from('subscriptions')
        .select('user_id, stato');
      const userIds = [...new Set((allSubs ?? []).map(s => s.user_id))];
      const activeIds = new Set((allSubs ?? []).filter(s => s.stato === 'attivo').map(s => s.user_id));
      const scadutiIds = userIds.filter(id => !activeIds.has(id));
      if (scadutiIds.length > 0) {
        const { data } = await supabase.from('profiles').select('email').in('id', scadutiIds);
        emails = (data ?? []).map(p => p.email).filter(Boolean);
      }

    } else if (filter === 'nessun_sub') {
      const { data: withSub } = await supabase.from('subscriptions').select('user_id');
      const withSubIds = new Set((withSub ?? []).map(s => s.user_id));
      const { data: allProfiles } = await supabase.from('profiles').select('id, email');
      emails = (allProfiles ?? []).filter(p => !withSubIds.has(p.id)).map(p => p.email).filter(Boolean);

    } else {
      // tutti
      const { data } = await supabase.from('profiles').select('email');
      emails = (data ?? []).map(p => p.email).filter(Boolean);
    }

    if (emails.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'Nessun destinatario trovato' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Invia email ───────────────────────────────────────────
    const html = buildHtml(subject, body, cta_url, cta_label);
    let sent = 0;
    for (const email of emails) {
      await sendEmail(email, subject, html);
      sent++;
    }

    console.log(`✅ Email inviata a ${sent} destinatari`);

    return new Response(JSON.stringify({ sent }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Errore send-admin-email:', err);
    return new Response(JSON.stringify({ error: 'Errore interno' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
