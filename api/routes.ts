import express from "express";
import { supabaseAdmin, resend, getBaseUrl, emailHeader, emailFooter, resendApiKey } from "./lib";

const apiRouter = express.Router();

// Debug middleware
apiRouter.use((req, res, next) => {
  console.log(`API Request: ${req.method} ${req.url}`);
  next();
});

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), vercel: !!process.env.VERCEL });
});

// Custom Signup with Resend Confirmation Email
apiRouter.post("/auth/signup", async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    if (!resendApiKey) {
      throw new Error("Il server non è configurato correttamente per l'invio delle email (RESEND_API_KEY mancante). Contatta l'amministratore.");
    }

    const appUrl = getBaseUrl(req);

    // 1. Create user in Supabase
    const { data: userData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName },
      email_confirm: false,
    });

    if (signUpError) throw signUpError;

    const user = userData.user;

    // 2. Create profile record
    if (user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ 
          id: user.id, 
          full_name: fullName, 
          email: email,
          role: 'customer'
        }, { onConflict: 'id' });
      
      if (profileError) {
        console.error("Profile creation error details:", profileError);
      }
    }

    // 3. Generate confirmation link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: { redirectTo: `${appUrl}` }
    });

    if (linkError) throw linkError;

    const confirmationLink = linkData.properties.action_link;

    // 4. Send email via Resend
    await resend.emails.send({
      from: 'Arcadia Lab <info@arcadialab.it>',
      to: [email],
      subject: 'Conferma il tuo account - Arcadia Lab',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333; background-color: #fdfaf9;">
          ${emailHeader}
          <div style="background-color: white; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <h1 style="color: #b56a56; font-style: italic; font-size: 24px; margin-bottom: 20px; text-align: center;">Benvenuto nella Community</h1>
            <p>Ciao <strong>${fullName || 'utente'}</strong>,</p>
            <p>Siamo felici di accoglierti in Arcadia Lab. Per completare l'attivazione del tuo account e iniziare il tuo percorso con noi, clicca sul pulsante qui sotto:</p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="${confirmationLink}" style="display: inline-block; padding: 18px 36px; background-color: #b56a56; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">Conferma Account</a>
            </div>
            <p style="font-size: 14px; color: #666; line-height: 1.6;">Se non hai richiesto tu questa iscrizione, puoi ignorare questa email.</p>
          </div>
          ${emailFooter}
        </div>
      `,
    });

    res.status(200).json({ message: "Account creato. Controlla la tua email per confermare." });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Password Recovery with Resend
apiRouter.post("/auth/recover", async (req, res) => {
  const { email } = req.body;

  try {
    if (!resendApiKey) {
      throw new Error("Il server non è configurato correttamente per l'invio delle email (RESEND_API_KEY mancante).");
    }

    const appUrl = getBaseUrl(req);

    // Generate recovery link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: { redirectTo: `${appUrl}/reset-password` }
    });

    if (linkError) throw linkError;

    const recoveryLink = linkData.properties.action_link;

    // Send email via Resend
    await resend.emails.send({
      from: 'Arcadia Lab <info@arcadialab.it>',
      to: [email],
      subject: 'Recupero Password - Arcadia Lab',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333; background-color: #fdfaf9;">
          ${emailHeader}
          <div style="background-color: white; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <h1 style="color: #b56a56; font-style: italic; font-size: 24px; margin-bottom: 20px; text-align: center;">Recupero Password</h1>
            <p>Hai richiesto il ripristino della password per il tuo account Arcadia Lab.</p>
            <p>Clicca sul link qui sotto per impostare una nuova password:</p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="${recoveryLink}" style="display: inline-block; padding: 18px 36px; background-color: #b56a56; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">Reimposta Password</a>
            </div>
            <p style="font-size: 14px; color: #666; line-height: 1.6;">Se non hai richiesto tu il recupero, puoi ignorare questa email.</p>
          </div>
          ${emailFooter}
        </div>
      `,
    });

    res.status(200).json({ message: "Email di recupero inviata." });
  } catch (error: any) {
    console.error("Recovery error:", error);
    res.status(400).json({ error: error.message });
  }
});

export { apiRouter };
