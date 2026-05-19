import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

// Logging strictly for debugging - REMOVE after testing if security is a concern
// But required to see what is missing in Vercel Logs
const checkEnv = (name: string, val: string | undefined) => {
  if (!val) {
    console.warn(`[DIAGNOSTIC] Missing environment variable: ${name}`);
    return false;
  }
  console.log(`[DIAGNOSTIC] Found ${name} (${val.substring(0, 5)}...)`);
  return true;
};

export const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
export const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
export const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

checkEnv("SUPABASE_URL", supabaseUrl);
checkEnv("SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey);
checkEnv("RESEND_API_KEY", resendApiKey);

let supabaseAdminClient: any = null;
export const getSupabaseAdmin = () => {
  if (!supabaseAdminClient) {
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(`Configurazione Supabase mancante. Controlla SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.`);
    }
    supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey);
  }
  return supabaseAdminClient;
};

let resendClient: any = null;
export const getResend = () => {
  if (!resendClient) {
    if (!resendApiKey) {
      throw new Error(`API Key di Resend mancante. Controlla RESEND_API_KEY.`);
    }
    resendClient = new Resend(resendApiKey);
  }
  return resendClient;
};

export const getBaseUrl = (req: any) => {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (!req) return "http://localhost:3000";
  const host = req.headers.host;
  const protocol = host?.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
};

export const emailHeader = `
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 32px; font-weight: bold; color: #b56a56; font-style: italic; letter-spacing: 2px;">ARCADIA LAB</div>
    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin-top: 5px;">Yoga & Pilates Studio</div>
  </div>
`;

export const emailFooter = `
  <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 30px;">
    © 2024 Arcadia Lab Studio. Tutti i diritti riservati.<br>
    Questo è un messaggio automatico, si prega di non rispondere.
  </p>
`;
