import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchLeads, saveLeadsToSupabase } from "../lib/serpApi";
import BackButton from "../components/BackButton";
import BottomNav from "../components/BottomNav";

export default function GoogleAPISearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSaved(false);
    setError(null);

    try {
      const leads = await searchLeads(query);
      setResults(leads);
    } catch (err) {
      console.error("❌ שגיאה בחיפוש:", err);
      setError("אירעה שגיאה בחיפוש. נסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (results.length === 0) return;
    try {
      const { error } = await saveLeadsToSupabase(results);
      if (!error) {
        setSaved(true);
        // ✅ ניווט למסך תוצאות אחרי שמירה
        navigate("/apps/leads/results");
      } else {
        setError("❌ שגיאה בשמירה ל-Supabase");
      }
    } catch (err) {
      console.error("❌ שגיאה בשמירה:", err);
      setError("אירעה שגיאה בשמירה");
    }
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
        paddingBottom: "80px", // ✅ כדי שהסרגל לא יסתיר תוכן
      }}
    >
      <h2>🔍 מציאת לקוחות חדשים</h2>
      <p>הכנס מילת חיפוש (לדוגמה: עורכי דין תל אביב)</p>

      <div style={{ marginBottom: "20px" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש כאן..."
          style={{
            padding: "10px",
            width: "70%",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          חפש
        </button>
      </div>

      {loading && <p>⏳ מחפש לקוחות...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

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
            💾 שמור לידים לסופבס
          </button>

          {saved && <p style={{ color: "green" }}>✅ הלידים נשמרו בהצלחה!</p>}
        </>
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <BackButton />
      </div>

      {/* ✅ סרגל ניווט תחתון קבוע */}
      <BottomNav />
    </div>
  );
}
