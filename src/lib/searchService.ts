// src/lib/searchService.ts
import { supabase } from "../supabaseClient";

export interface Search {
  id?: string;
  term: string;
  location?: string;
  source: string;
  total_results: number;
  executed_at: string;
}

export interface SearchResult {
  search_id: string;
  lead_id: string;
  rank?: number;
  inserted_at?: string;
}

/* ===================== חיפושים ===================== */

export async function getSearches(limit: number = 50): Promise<Search[]> {
  try {
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .order("executed_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("❌ getSearches error:", err);
    return [];
  }
}

export async function getSearchById(id: string): Promise<Search | null> {
  try {
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("❌ getSearchById error:", err);
    return null;
  }
}

export async function addSearch(term: string, source: string, total_results: number, location?: string) {
  try {
    const { data, error } = await supabase.from("searches").insert([
      {
        term,
        source,
        total_results,
        location: location || "",
        executed_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("❌ addSearch error:", err);
    return null;
  }
}

export async function updateSearch(id: string, fields: Partial<Search>) {
  try {
    const { data, error } = await supabase
      .from("searches")
      .update({ ...fields, executed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("❌ updateSearch error:", err);
    return null;
  }
}

export async function deleteSearch(id: string) {
  try {
    const { error } = await supabase.from("searches").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("❌ deleteSearch error:", err);
    return false;
  }
}

/* ===================== תוצאות חיפוש ===================== */

export async function getResultsBySearchId(searchId: string): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabase
      .from("search_results")
      .select("*")
      .eq("search_id", searchId)
      .order("inserted_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("❌ getResultsBySearchId error:", err);
    return [];
  }
}

export async function addSearchResults(searchId: string, results: any[]) {
  if (!results?.length) return { data: [], error: null };

  try {
    const normalized = results.map((r, i) => ({
      search_id: searchId,
      lead_id: r.lead_id || "",
      rank: r.rank || i + 1,
      inserted_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from("search_results").insert(normalized);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error("❌ addSearchResults error:", err);
    return { data: [], error: err };
  }
}

export async function deleteResultsBySearchId(searchId: string) {
  try {
    const { error } = await supabase.from("search_results").delete().eq("search_id", searchId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("❌ deleteResultsBySearchId error:", err);
    return false;
  }
}
