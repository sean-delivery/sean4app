import { useEffect, useState } from "react";
import { getLeads, searchLeads, saveLeadsToSupabase } from "../lib/leadService";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // שליפה ראשונית של לידים קיימים
  useEffect(() => {
    async function fetchLeads() {
      const data = await getLeads();
      setLeads(data);
    }
    fetchLeads();
  }, []);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const results = await searchLeads(query);
      if (results.length > 0) {
        await saveLeadsToSupabase(results);
        const data = await getLeads();
        setLeads(data);
      }
    } catch (err) {
      console.error("❌ שגיאה בחיפוש:", err);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto" }}>
      <h1>📈 מציאת לקוחות חדשים</h1>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="הכנס מילת חיפוש (לדוגמה: עורך דין תל אביב)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "10px", width: "70%" }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{ marginLeft: "10px", padding: "10px 20px" }}
        >
          {loading ? "⏳ מחפש..." : "חפש"}
        </button>
      </div>

      {/* טבלה של לידים */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>שם עסק</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>טלפון</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>כתובת</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>אתר</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>קטגוריה</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                אין לידים להצגה.
              </td>
            </tr>
          ) : (
            leads.map((lead, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {lead.business_name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {lead.phone}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {lead.address}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noreferrer">
                      לאתר
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {lead.category}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
