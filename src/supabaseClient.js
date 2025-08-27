import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error("VITE_SUPABASE_URL missing");
if (!supabaseKey) throw new Error("VITE_SUPABASE_ANON_KEY missing");

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// כתובת redirect אוטומטית – local או production
export const redirectUrl =
  import.meta.env.MODE === "development"
    ? "http://localhost:5173"
    : "https://sean4app.netlify.app";
