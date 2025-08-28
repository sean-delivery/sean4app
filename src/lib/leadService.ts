// src/lib/leadService.ts
import { supabase } from "../supabaseClient";

const SERP_API_KEY: string = import.meta.env.VITE_SERPAPI_KEY;

function deduplicateLeads(leads: any[]) {
  const map = new Map();
  leads.forEach((l) => {
    const key = `${(l.business_name || "").trim()}-${(l.phone || "").trim()}-${(l.website || "").trim()}`;
    if (!map.has(key)) map.set(key, l);
  });
  return Array.from(map.values());
}

function normalizeLeads(items: any[]) {
  return items.map((i: any) => ({
    business_name: i.title || i.business_name || "",
    phone: i.phone || i.phone_number || "",
    email: i.email || "",
    address: i.address || i.location || "",
    website: i.website || i.link || "",
    category: i.category || i.type || "",
    status: "חדש",
    notes: "",
    callSchedule: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    raw: i || {}, // שמירה של כל מה שחזר מה־API
  }));
}

export async function getLeads(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("❌ getLeads error:", err);
    return [];
  }
}

export async function addLead(lead: any) {
  try {
    const { data, error } = await supabase.from("leads").insert([{
      ...lead,
      updated_at: new Date().toISOString(),
    }]);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("❌ addLead error:", err);
    return null;
  }
}

export async function updateLead(id: string, fields: Partial<any>) {
  try {
    const { data, error } = await supabase
      .from("leads")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("❌ updateLead error:", err);
    return null;
  }
}

export async function deleteLead(id: string) {
  try {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("❌ deleteLead error:", err);
    return false;
  }
}

export async function searchLeads(query: string, city: string) {
  const term = `${query} ${city}`;
  try {
    // ניסיון 1 – Edge Function
    const edgeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/serpapi-search`;
    const edgeRes = await fetch(edgeUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: term, location: city, maxResults: 50 }),
    });

    if (edgeRes.ok) {
      const data = await edgeRes.json();
      if (data.local_results?.length) {
        return await handleResults(term, data.local_results, "edge");
      }
    }

    // ניסיון 2 – Netlify Function
    const netlifyUrl = "/.netlify/functions/serpapi";
    const netlifyRes = await fetch(`${netlifyUrl}?q=${encodeURIComponent(term)}`);
    if (netlifyRes.ok) {
      const data = await netlifyRes.json();
      if (data.local_results?.length) {
        return await handleResults(term, data.local_results, "netlify");
      }
    }

    // ניסיון 3 – SerpAPI ישיר
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(term)}&hl=he&gl=il&api_key=${SERP_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    return await handleResults(term, data.local_results || [], "direct");
  } catch (err) {
    console.error("❌ searchLeads error:", err);
    return [];
  }
}

async function handleResults(term: string, results: any[], source: string) {
  const leads = normalizeLeads(results);
  const unique = deduplicateLeads(leads);

  await logSearch(term, unique.length, source);
  await saveLeadsToSupabase(unique);

  return unique;
}

export async function saveLeadsToSupabase(leads: any[]) {
  if (!leads?.length) return { data: [], error: null };
  try {
    const deduped = deduplicateLeads(leads);
    const { data, error } = await supabase
      .from("leads")
      .insert(deduped); // אם תרצה upsert – צריך אינדקס ייחודי
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error("❌ saveLeadsToSupabase error:", err);
    return { data: [], error: err };
  }
}

export async function logSearch(term: string, results: number, source: string) {
  try {
    await supabase.from("searches").insert([
      { term, results, source, executed_at: new Date().toISOString() },
    ]);
  } catch (err) {
    console.warn("⚠️ logSearch failed:", err);
  }
}
