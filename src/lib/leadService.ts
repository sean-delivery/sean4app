// src/lib/leadService.ts
import { supabase } from "../supabaseClient";

const SERP_API_KEY: string = import.meta.env.VITE_SERPAPI_KEY;

/**
 * שליפת לידים קיימים מהטבלה
 */
export async function getLeads() {
  try {
    const { data, error } = await supabase.from("leads").select("*").limit(20);
    if (error) {
      console.error("❌ שגיאה בשליפת לידים:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("❌ תקלה לא צפויה ב־getLeads:", err);
    return [];
  }
}

/**
 * הוספת ליד חדש לטבלה
 */
export async function addLead(lead: any) {
  try {
    const { data, error } = await supabase.from("leads").insert([lead]);
    if (error) {
      console.error("❌ שגיאה בהוספת ליד:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("❌ תקלה לא צפויה ב־addLead:", err);
    return null;
  }
}

/**
 * חיפוש לידים ב־SerpAPI
 */
export async function searchLeads(query: string) {
  try {
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(
      query
    )}&hl=he&gl=il&api_key=${SERP_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.local_results) return [];

    return data.local_results.map((item: any) => ({
      business_name: item.title || "",
      phone: item.phone || "",
      address: item.address || "",
      website: item.website || "",
      category: item.category || "",
    }));
  } catch (err) {
    console.error("❌ שגיאה ב־searchLeads:", err);
    return [];
  }
}

/**
 * שמירת לידים בטבלת Supabase
 */
export async function saveLeadsToSupabase(leads: any[]) {
  if (!leads || leads.length === 0) return { error: null, data: [] };

  try {
    const { data, error } = await supabase.from("leads").insert(leads);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error("❌ שגיאה ב־saveLeadsToSupabase:", err);
    return { data: [], error: err };
  }
}
