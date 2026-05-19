import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin, getResend, getBaseUrl, emailHeader, emailFooter, resendApiKey } from './lib';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const action = req.query.action || req.body?.action;

  console.log(`[API Auth] Action: ${action} | Method: ${req.method}`);

  if (req.method !== 'POST' && action !== 'health' && action !== 'diagnostics') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    switch (action) {
      case 'health':
        return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });

      case 'diagnostics':
        return res.status(200).json({ 
          status: 'checking_envs',
          hasSupabaseUrl: !!supabaseUrl,
          hasServiceRoleKey: !!serviceRoleKey,
          hasResendKey: !!resendApiKey,
          nodeEnv: process.env.NODE_ENV,
          vercel: !!process.env.VERCEL
        });

      case 'signup': {
        const { email, password, fullName } = req.body;
        if (!email || !password) throw new Error("Email e password sono obbligatorie");

        const appUrl = getBaseUrl(req);
        const supabaseAdmin = getSupabaseAdmin();
        const resend = getResend();

        // 1. Create user in Supabase
        const { data: userData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          user_metadata: { full_name: fullName },
          email_confirm: false,
        });

        if (signUpError) throw signUpError;
        const user = userData.user;

        // 2. Create profile
        if (user) {
          await supabaseAdmin.from('profiles').upsert({ 
            id: user.id, 
            full_name: fullName, 
            email: email,
            role: 'customer'
          });
        }

        // 3. Link
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email: email,
          options: { redirectTo: `${appUrl}` }
        });
        if (linkError) throw linkError;

        // 4. Email
        await resend.emails.send({
          from: 'Arcadia Lab <info@arcadialab.it>',
          to: [email],
          subject: 'Conferma il tuo account - Arcadia Lab',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdfaf9;">
              ${emailHeader}
              <div style="background-color: white; padding: 30px; border-radius: 16px; border: 1px solid #eee;">
                <h2 style="color: #b56a56;">Benvenuto in Arcadia Lab</h2>
                <p>Ciao <strong>${fullName || 'utente'}</strong>,</p>
                <p>Clicca sul pulsante per confermare il tuo account:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${linkData.properties.action_link}" style="background-color: #b56a56; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">CONFERMA ACCOUNT</a>
                </div>
              </div>
              ${emailFooter}
            </div>
          `,
        });

        return res.status(200).json({ message: "Account creato. Controlla la tua email." });
      }

      case 'recover': {
        const { email } = req.body;
        if (!email) throw new Error("Email obbligatoria");

        const appUrl = getBaseUrl(req);
        const supabaseAdmin = getSupabaseAdmin();
        const resend = getResend();

        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: { redirectTo: `${appUrl}/reset-password` }
        });

        if (linkError) throw linkError;

        await resend.emails.send({
          from: 'Arcadia Lab <info@arcadialab.it>',
          to: [email],
          subject: 'Recupero Password - Arcadia Lab',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              ${emailHeader}
              <div style="background-color: white; padding: 30px; border-radius: 16px; border: 1px solid #eee;">
                <h2 style="color: #b56a56;">Recupero Password</h2>
                <p>Clicca sotto per impostare una nuova password:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${linkData.properties.action_link}" style="background-color: #b56a56; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">REIMPOSTA PASSWORD</a>
                </div>
              </div>
              ${emailFooter}
            </div>
          `,
        });

        return res.status(200).json({ message: "Email di recupero inviata." });
      }

      default:
        return res.status(400).json({ error: 'Azione non riconosciuta' });
    }
  } catch (error: any) {
    console.error(`[API Auth Error]`, error);
    return res.status(500).json({ error: error.message || 'Errore interno del server' });
  }
}
