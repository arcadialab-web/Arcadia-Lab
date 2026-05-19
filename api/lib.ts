import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

export const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
export const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("CRITICAL: Missing Supabase URL or Service Role Key.");
}

export const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

let supabaseAdminClient: any = null;
export const getSupabaseAdmin = () => {
  if (!supabaseAdminClient) {
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase configuration");
    }
    supabaseAdminClient = createClient(supabaseUrl || "https://placeholder.supabase.co", serviceRoleKey || "placeholder");
  }
  return supabaseAdminClient;
};

let resendClient: any = null;
export const getResend = () => {
  if (!resendClient) {
    resendClient = new Resend(resendApiKey || "missing_key");
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
