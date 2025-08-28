import { supabase as sb } from "../supabaseClient";

const NETLIFY_ENDPOINT = '/.netlify/functions/serpapi';

export type NormalizedLead = {
  place_id: string;
  rank?: number;
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  lat?: number;
  lng?: number;
  categories?: string[];
  status?: string;
};

/* 🌀 נרמול פריט מ־SerpAPI */
export function normalizeSerpItem(item: any, rank?: number): NormalizedLead {
  const gps = item?.gps_coordinates || {};
  const open = item?.opening_hours?.open_now;
  const cats = Array.isArray(item?.type)
    ? item.type
    : Array.isArray(item?.category)
    ? item.category
    : item?.type
    ? String(item.type).split(",").map((s: string) => s.trim())
    : undefined;

  return {
    place_id:
      item.place_id ||
      item.cid ||
      item.data_id ||
      `${item.title}-${item.address}-${rank ?? ""}`,
    rank,
    name: item.title ?? item.name,
    address: item.address,
    phone: item.phone?.replace(/\s+/g, "") || undefined,
    website: item.website,
    rating: typeof item.rating === "number" ? item.rating : undefined,
    reviews_count:
      typeof item.reviews === "number"
        ? item.reviews
        : typeof item.user_ratings_total === "number"
        ? item.user_ratings_total
        : undefined,
    lat: typeof gps.latitude === "number" ? gps.latitude : undefined,
    lng: typeof gps.longitude === "number" ? gps.longitude : undefined,
    categories: cats,
    status: open === true ? "open" : open === false ? "closed" : "unknown",
  };
}

/* 💾 שמירת גיבוי אוטומטי של לידים */
export function saveLeadsBackup(leads: NormalizedLead[], searchTerm: string) {
  const timestamp = new Date().toISOString();
  const backupKey = `leads_backup_${timestamp.split("T")[0]}`;
  const backup = {
    timestamp,
    searchTerm,
    leads,
    count: leads.length,
  };

  localStorage.setItem(backupKey, JSON.stringify(backup));

  const backupsList = JSON.parse(
    localStorage.getItem("leads_backups_list") || "[]"
  );
  backupsList.push({
    key: backupKey,
    timestamp,
    searchTerm,
    count: leads.length,
  });

  const limitedBackups = backupsList.slice(-50);
  localStorage.setItem("leads_backups_list", JSON.stringify(limitedBackups));

  console.log(`💾 גיבוי נשמר: ${backupKey} (${leads.length} לידים)`);
}

/* 🔄 שחזור לידים מגיבויים */
export function restoreLeadsFromBackups(): NormalizedLead[] {
  console.log("🔍 מחפש לידים בגיבויים...");

  const backupsList = JSON.parse(
    localStorage.getItem("leads_backups_list") || "[]"
  );
  const allRestoredLeads: NormalizedLead[] = [];

  backupsList.forEach((backup: any) => {
    try {
      const backupData = localStorage.getItem(backup.key);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        if (parsed.leads && Array.isArray(parsed.leads)) {
          allRestoredLeads.push(...parsed.leads);
          console.log(`✅ שוחזרו ${parsed.leads.length} לידים מ-${backup.key}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️ שגיאה בשחזור ${backup.key}:`, error);
    }
  });

  const uniqueLeads = allRestoredLeads.filter(
    (lead, index, self) =>
      index === self.findIndex((l) => l.place_id === lead.place_id)
  );

  console.log(`🎉 שוחזרו ${uniqueLeads.length} לידים ייחודיים מגיבויים`);
  return uniqueLeads;
}

/* 📡 חיפוש ושמירה */
export async function searchSerpAndSave(q: string, location?: string) {
  console.log("🔍 searchSerpAndSave called with:", { q, location });

  if (!q?.trim()) {
    throw new Error("חסר פרמטר חיפוש");
  }

  // ניסיון ראשון דרך Supabase Edge
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/serpapi-search`;
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: q,
        location: location || "Israel",
        maxResults: 60,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.local_results && data.local_results.length > 0) {
        const rows = data.local_results.map((item: any, index: number) =>
          normalizeSerpItem(item, index + 1)
        );
        console.log("✅ Supabase Edge Function success:", rows.length);
        return { searchId: null, rows };
      }
    }
    console.log("⚠️ Supabase Edge Function failed, trying Netlify...");
  } catch (supabaseError) {
    console.log("⚠️ Supabase Edge Function error, trying Netlify...", supabaseError);
  }

  // אם נכשל → ימשיך ל־Netlify (במחלקה)
  return { searchId: null, rows: [] };
}
/* ===== ממשקים לתוצאות מ־SerpAPI ===== */
interface SerpApiResult {
  position: number;
  title: string;
  place_id: string;
  data_id?: string;
  data_cid?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  reviews?: number;
  type?: string;
  types?: string[];
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  thumbnail?: string;
}

interface SerpApiResponse {
  local_results: SerpApiResult[];
  search_metadata: { id: string; status: string };
}

/* ===== מחלקת ניהול SerpAPI ===== */
class SerpApiManager {
  private readonly ENDPOINT = NETLIFY_ENDPOINT;
  private readonly FALLBACK_TOKEN =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "FAKE_FALLBACK_TOKEN_FOR_DEV_ONLY";

  /* 🔍 חיפוש עם התקדמות */
  async searchGoogleMapsWithProgress(
    query: string,
    location: string = "Israel",
    maxResults: number = 100,
    onProgress?: (p: { current: number; total: number; page: number }) => void
  ): Promise<SerpApiResult[]> {
    console.log("🚀 מתחיל חיפוש מתקדם עם SerpAPI...");
    const allResults: SerpApiResult[] = [];
    const perPage = 20;
    let start = 0;
    const totalPages = Math.ceil(maxResults / perPage);

    for (let page = 0; page < totalPages; page++) {
      if (onProgress) {
        onProgress({ current: allResults.length, total: maxResults, page });
      }

      const pageResults = await this.searchSinglePage(query, location, start);

      if (pageResults.length === 0) {
        console.log("🏁 אין עוד תוצאות");
        break;
      }

      allResults.push(...pageResults);

      if (allResults.length >= maxResults) break;

      start += perPage;
      await new Promise((r) => setTimeout(r, 1500)); // מניעת חסימה
    }

    const final = allResults.slice(0, maxResults);
    console.log(`🎉 חיפוש הושלם: ${final.length} תוצאות`);
    return final;
  }

  /* 🔍 חיפוש פשוט */
  async searchGoogleMaps(
    query: string,
    location: string = "Israel",
    maxResults: number = 100
  ): Promise<SerpApiResult[]> {
    return this.searchGoogleMapsWithProgress(query, location, maxResults);
  }

  /* 📄 חיפוש עמוד אחד */
  private async searchSinglePage(
    query: string,
    location: string,
    start: number
  ): Promise<SerpApiResult[]> {
    console.log(`🔎 מחפש עמוד ${Math.floor(start / 20) + 1}...`);

    const response = await fetch(this.ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.FALLBACK_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, location, start, maxResults: 20 }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `❌ SerpAPI Error (${response.status}): ${errorText.substring(0, 100)}`
      );
    }

    const data: SerpApiResponse = await response.json();
    return data.local_results || [];
  }

  /* 📍 פרטי עסק בודד */
  async getPlaceDetails(placeId: string): Promise<any> {
    const response = await fetch(this.ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.FALLBACK_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ place_id: placeId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`❌ PlaceDetails Error: ${errorText}`);
    }

    return await response.json();
  }

  /* ✅ בדיקת API Key */
  async testApiKey(): Promise<boolean> {
    try {
      await this.searchSinglePage("בדיקה", "Israel", 0);
      return true;
    } catch (e: any) {
      console.error("❌ API Key לא תקין:", e.message);
      return false;
    }
  }

  /* 📊 מידע שימוש */
  async getUsageInfo(): Promise<any> {
    try {
      const response = await fetch(this.ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.FALLBACK_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "account" }),
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (e) {
      console.error("⚠️ לא ניתן להביא usage info:", e);
      return null;
    }
  }
}

export const serpApi = new SerpApiManager();
