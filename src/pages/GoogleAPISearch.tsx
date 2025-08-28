// src/pages/GoogleAPISearch.tsx
import React, { useState, useEffect } from "react";
import { searchLeads, saveLeadsToSupabase, logSearch } from "../lib/leadService";
import BackButton from "../components/BackButton";
import BottomNav from "../components/BottomNav";

export default function GoogleAPISearch() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // טען היסטוריית חיפושים מה־localStorage
  useEffect(() => {
    const saved = localStorage.getItem("search_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addToHistory = (term: string) => {
    const updated = [term, ...history.filter((h) => h !== term)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  async function handleSearch() {
    if (!query.trim() || !city.trim()) return;
    setLoading(true);
    setSaved(false);
    setError(null);

    try {
      const term = `${query} ${city}`;
      const leads = await searchLeads(query, city);
      setResults(leads);
      addToHistory(term);
      await logSearch(term, leads.length, "GoogleAPISearch");
    } catch (err) {
      console.error("❌ שגיאה בחיפוש:", err);
      setError("אירעה שגיאה בחיפוש. נסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!results.length) return;
    try {
      const { error } = await saveLeadsToSupabase(results);
      if (!error) {
        setSaved(true);
        alert("✅ הלידים נשמרו בהצלחה!");
      } else {
        setError("❌ שגיאה בשמירה ל-Supabase");
      }
    } catch (err) {
      console.error("❌ שגיאה בשמירה:", err);
      setError("אירעה שגיאה בשמירה");
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", paddingBottom: "80px" }}>
      <h2>🔍 מציאת לקוחות חדשים</h2>
      <p>בחר תחום + עיר כדי למצוא לקוחות פוטנציאליים</p>

      {/* שורת חיפוש כפולה */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="מה לחפש? (לדוגמה: עורכי דין)"
          style={{ padding: "10px", flex: "1", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="עיר (לדוגמה: תל אביב)"
          style={{ padding: "10px", flex: "1", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "⏳ מחפש..." : "חפש"}
        </button>
      </div>

      {loading && <p>⏳ מחפש לקוחות...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* היסטוריית חיפושים */}
      {history.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <strong>חיפושים אחרונים:</strong>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  const parts = h.split(" ");
                  setQuery(parts.slice(0, -1).join(" "));
                  setCity(parts.slice(-1)[0]);
                }}
                style={{
                  padding: "5px 10px",
                  background: "#f3f4f6",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* תוצאות */}
      {results.length > 0 && (
        <>
          <h3>תוצאות:</h3>
          <ul>
            {results.map((lead, i) => (
              <li key={i} style={{ marginBottom: "10px" }}>
                <strong>{lead.business_name}</strong> – {lead.phone} – {lead.address}
                <br />
                <a href={lead.website} target="_blank" rel="noreferrer">
                  {lead.website}
                </a>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSave}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            💾 שמור לידים לטבלה
          </button>

          {saved && <p style={{ color: "green" }}>✅ הלידים נשמרו בהצלחה!</p>}
        </>
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <BackButton />
      </div>
      <BottomNav />
    </div>
  );
}
