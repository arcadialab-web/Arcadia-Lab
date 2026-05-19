import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase Admin (for user management and generating links)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.APP_URL || "http://localhost:3000";

// --- API ROUTES ---

// Custom Signup with Resend Confirmation Email
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    // 1. Create user in Supabase without sending the default email
    const { data: userData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName },
      email_confirm: false, // We will confirm manually via Resend link
    });

    if (signUpError) throw signUpError;

    const user = userData.user;

    // 2. Create profile record in the 'profiles' table
    if (user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([
          { 
            id: user.id, 
            full_name: fullName, 
            email: email,
            role: 'customer' // Default role
          }
        ]);
      
      if (profileError) {
        console.error("Profile creation error:", profileError);
        // We don't necessarily want to fail signup if profile fails, 
        // but it's better to know. For now we continue.
      }
    }

    // 3. Generate confirmation link
    // We point it to /auth/callback so the frontend can handle the session if needed, 
    // though Supabase usually handles the verification upon clicking.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: { redirectTo: `${APP_URL}` }
    });

    if (linkError) throw linkError;

    const confirmationLink = linkData.properties.action_link;

    // 4. Send email via Resend
    await resend.emails.send({
      from: 'Arcadia Lab <onboarding@resend.dev>',
      to: [email],
      subject: 'Conferma il tuo account - Arcadia Lab',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333; background-color: #fdfaf9;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 32px; font-weight: bold; color: #b56a56; font-style: italic; letter-spacing: 2px;">ARCADIA LAB</div>
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin-top: 5px;">Yoga & Pilates Studio</div>
          </div>
          <div style="background-color: white; padding: 40px; border-radius: 24px; shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <h1 style="color: #b56a56; font-style: italic; font-size: 24px; margin-bottom: 20px; text-align: center;">Benvenuto nella Community</h1>
            <p>Ciao <strong>${fullName || 'utente'}</strong>,</p>
            <p>Siamo felici di accoglierti in Arcadia Lab. Per completare l'attivazione del tuo account e iniziare il tuo percorso con noi, clicca sul pulsante qui sotto:</p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="${confirmationLink}" style="display: inline-block; padding: 18px 36px; background-color: #b56a56; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">Conferma Account</a>
            </div>
            <p style="font-size: 14px; color: #666; line-height: 1.6;">Se non hai richiesto tu questa iscrizione, puoi ignorare questa email.</p>
          </div>
          <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 30px;">
            © 2024 Arcadia Lab Studio. Tutti i diritti riservati.<br>
            Via del Benessere, QC
          </p>
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
app.post("/api/auth/recover", async (req, res) => {
  const { email } = req.body;

  try {
    // Generate recovery link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: { redirectTo: `${APP_URL}/reset-password` }
    });

    if (linkError) throw linkError;

    const recoveryLink = linkData.properties.action_link;

    // Send email via Resend
    await resend.emails.send({
      from: 'Arcadia Lab <auth@resend.dev>',
      to: [email],
      subject: 'Recupero Password - Arcadia Lab',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333; background-color: #fdfaf9;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 32px; font-weight: bold; color: #b56a56; font-style: italic; letter-spacing: 2px;">ARCADIA LAB</div>
          </div>
          <div style="background-color: white; padding: 40px; border-radius: 24px;">
            <h1 style="color: #b56a56; font-style: italic; font-size: 24px; margin-bottom: 20px; text-align: center;">Recupero Password</h1>
            <p>Abbiamo ricevuto una richiesta di ripristino della password per il tuo account Arcadia Lab.</p>
            <p>Per impostare una nuova password, clicca sul pulsante qui sotto:</p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="${recoveryLink}" style="display: inline-block; padding: 18px 36px; background-color: #b56a56; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">Reimposta Password</a>
            </div>
            <p style="font-size: 14px; color: #666; line-height: 1.6;">Se non hai richiesto tu il ripristino, puoi tranquillamente ignorare questa email.</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: "Email di recupero inviata." });
  } catch (error: any) {
    console.error("Recovery error:", error);
    res.status(400).json({ error: error.message });
  }
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
