import { createClient } from "@supabase/supabase-js";

// נטען מה־env של Vite (ולא לשים אותם ישירות בקוד!)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key. Check your Netlify environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
