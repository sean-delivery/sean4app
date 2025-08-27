import { useEffect, useState } from "react";
import {
  getLeads,
  searchLeads,
  saveLeadsToSupabase,
} from "../lib/leadService";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [callSchedule, setCallSchedule] = useState<{ [key: string]: string }>(
    {}
  );

  // שליפה ראשונית של לידים
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

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        📈 מציאת לקוחות חדשים
      </h1>

      {/* שורת החיפוש */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="הכנס מילת חיפוש (לדוגמה: עורך דין תל אביב)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: "10px",
            flex: "1",
            minWidth: "250px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
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

      {/* טבלה של לידים */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>⭐</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                שם עסק
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                טלפון
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>מייל</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                כתובת
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                קטגוריה
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                סטטוס
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                הערות
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                תזמון שיחה
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                פעולות
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  אין לידים להצגה.
                </td>
              </tr>
            ) : (
              leads.map((lead: any, i: number) => (
                <tr key={i}>
                  {/* מועדפים */}
                  <td
                    style={{ border: "1px solid #ddd", textAlign: "center" }}
                  >
                    <button
                      onClick={() => toggleFavorite(lead.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      {favorites.includes(lead.id) ? "⭐" : "☆"}
                    </button>
                  </td>

                  {/* שם עסק */}
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {lead.business_name}
                  </td>

                  {/* טלפון */}
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {lead.phone ? (
                      <>
                        <a href={`tel:${lead.phone}`}>{lead.phone}</a> |{" "}
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          וואטסאפ
                        </a>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* מייל */}
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`}>{lead.email}</a>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* כתובת */}
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {lead.address || "-"}
                  </td>

                  {/* קטגוריה */}
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {lead.category || "-"}
                  </td>

                  {/* סטטוס */}
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <select
                      value={statuses[lead.id] || "חדש"}
                      onChange={(e) =>
                        setStatuses({ ...statuses, [lead.id]: e.target.value })
                      }
                    >
                      <option>חדש</option>
                      <option>בטיפול</option>
                      <option>נסגר</option>
                    </select>
                  </td>

                  {/* הערות */}
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <input
                      type="text"
                      placeholder="כתוב הערה..."
                      value={notes[lead.id] || ""}
                      onChange={(e) =>
                        setNotes({ ...notes, [lead.id]: e.target.value })
                      }
                      style={{ width: "100%" }}
                    />
                  </td>

                  {/* תזמון שיחה */}
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <input
                      type="date"
                      value={callSchedule[lead.id] || ""}
                      onChange={(e) =>
                        setCallSchedule({
                          ...callSchedule,
                          [lead.id]: e.target.value,
                        })
                      }
                    />
                  </td>

                  {/* פעולות */}
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <button
                      onClick={() => alert(`📞 יוצר קשר עם ${lead.business_name}`)}
                      style={{
                        padding: "5px 10px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      שיחה
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
