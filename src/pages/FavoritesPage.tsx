// src/pages/FavoritesPage.tsx
import { useEffect, useState } from "react";
import { getLeads, updateLead, deleteLead } from "../lib/leadService";
import BackButton from "../components/BackButton";
import BottomNav from "../components/BottomNav";

export default function FavoritesPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchFavorites() {
      const allLeads = await getLeads();
      const favs = allLeads.filter((l: any) => l.is_favorite === true);
      setLeads(favs);
    }
    fetchFavorites();
  }, []);

  async function handleUpdate(id: string) {
    const status = statuses[id] || "חדש";
    const note = notes[id] || "";
    await updateLead(id, { status, notes: note });
    alert("✅ ליד עודכן בהצלחה");
  }

  async function handleDelete(id: string) {
    if (window.confirm("למחוק ליד זה?")) {
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "2rem auto", padding: "0 1rem", paddingBottom: "100px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>⭐ לידים במעקב אישי</h1>

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
            <th>שם עסק</th>
            <th>טלפון</th>
            <th>מייל</th>
            <th>סטטוס</th>
            <th>הערות</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                אין פייבוריטים להצגה.
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.business_name}</td>
                <td>{lead.phone || "-"}</td>
                <td>{lead.email || "-"}</td>
                <td>
                  <select
                    value={statuses[lead.id] || lead.status || "חדש"}
                    onChange={(e) => setStatuses({ ...statuses, [lead.id]: e.target.value })}
                  >
                    <option>חדש</option>
                    <option>בטיפול</option>
                    <option>נסגר</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={notes[lead.id] || lead.notes || ""}
                    onChange={(e) => setNotes({ ...notes, [lead.id]: e.target.value })}
                  />
                </td>
                <td>
                  <button
                    onClick={() => handleUpdate(lead.id)}
                    style={{ padding: "5px 10px", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", marginRight: "5px" }}
                  >
                    עדכון
                  </button>
                  <button
                    onClick={() => handleDelete(lead.id)}
                    style={{ padding: "5px 10px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px" }}
                  >
                    מחיקה
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <BackButton />
      </div>
      <BottomNav />
    </div>
  );
}
