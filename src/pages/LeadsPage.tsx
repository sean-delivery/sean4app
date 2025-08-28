// src/pages/LeadsPage.tsx
import { useEffect, useState } from "react";
import {
  getLeads,
  searchLeads,
  saveLeadsToSupabase,
  logSearch,
  deleteLead,
  updateLead,
} from "../lib/leadService";
import BackButton from "../components/BackButton";
import BottomNav from "../components/BottomNav";
import PhoneCleanupModal from "../components/leads/PhoneCleanupModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";   // ✅ תיקון יבוא

// ✅ טיפוס Lead כדי להפסיק שגיאות any
type Lead = {
  id: string;
  business_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  category?: string;
  status?: string;
  notes?: string;
  callSchedule?: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
const [notes, setNotes] = useState<Record<string, string>>({});
const [callSchedule, setCallSchedule] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [showCleanup, setShowCleanup] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    async function fetchLeads() {
      const data = await getLeads();
      setLeads(data);
    }
    fetchLeads();

    const savedHistory = localStorage.getItem("search_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const addToHistory = (term: string) => {
    const updated = [term, ...history.filter((h) => h !== term)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  async function handleSearch() {
    if (!query.trim() || !city.trim()) return;
    setLoading(true);
    try {
      const term = `${query} ${city}`;
      const results = await searchLeads(query, city);

      if (results.length > 0) {
        await saveLeadsToSupabase(results);
        const data = await getLeads();
        setLeads(data);
        addToHistory(term);
        await logSearch(term, results.length, "LeadsPage");
      }
    } catch (err) {
      console.error("❌ שגיאה בחיפוש:", err);
    } finally {
      setLoading(false);   // ✅ תמיד מכבה טעינה
    }
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  async function handleDelete(id: string) {
    if (window.confirm("האם למחוק את הליד הזה?")) {
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  }

  async function handleUpdate(id: string) {
    const status = statuses[id] || "חדש";
    const note = notes[id] || "";
    const schedule = callSchedule[id] || "";
    await updateLead(id, { status, notes: note, callSchedule: schedule });
    alert("✅ ליד עודכן בהצלחה");
  }

  function exportToExcel() {
    if (leads.length === 0) {
      alert("אין נתונים לייצוא");
      return;
    }

    const header = [
      ["שם עסק", "Business Name", "اسم الشركة", "Название бизнеса"],
      ["טלפון", "Phone", "هاتف", "Телефон"],
      ["מייל", "Email", "بريد إلكترוני", "Эл. почта"],
      ["כתובת", "Address", "عنوان", "Адрес"],
      ["קטגוריה", "Category", "فئة", "Категория"],
      ["סטטוס", "Status", "الحالة", "Статус"],
      ["הערות", "Notes", "ملاحظات", "Заметки"],
      ["תזמון שיחה", "Call Schedule", "جدولة مكالمות", "График звонков"],
    ];

    const data = leads.map((lead) => [
      lead.business_name || "",
      lead.phone || "",
      lead.email || "",
      lead.address || "",
      lead.category || "",
      lead.status || "",
      lead.notes || "",
      lead.callSchedule || "",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header.map((h) => h[0]), ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "leads_backup.xlsx"
    );
  }

  function importFromExcel(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const importedData: any[] = XLSX.utils.sheet_to_json(sheet);

      const keyMap = {
        business_name: ["שם עסק", "Business Name", "اسم الشركة", "Название бизнеса"],
        phone: ["טלפון", "Phone", "هاتف", "Телефон"],
        email: ["מייל", "Email", "بريد إلكترוני", "Эл. почта"],
        address: ["כתובת", "Address", "عنوان", "Адрес"],
        category: ["קטגוריה", "Category", "فئة", "Категория"],
        status: ["סטטוס", "Status", "الحالة", "Статус"],
        notes: ["הערות", "Notes", "ملاحظات", "Заметки"],
        callSchedule: ["תזמון שיחה", "Call Schedule", "جدولة مكالمות", "График звонков"],
      };

      const newLeads: Lead[] = importedData.map((row: any) => {
        const mapped: any = { id: crypto.randomUUID() }; // ✅ נותן ID לכל ליד חדש
        for (const key in keyMap) {
          const labels = (keyMap as any)[key];
          mapped[key] =
            labels.map((l: string) => row[l]).find((v) => v !== undefined) || "";
        }
        return mapped;
      });

      setLeads((prev) => [...prev, ...newLeads]);
      saveLeadsToSupabase(newLeads);
      alert(`✅ נוספו ${newLeads.length} לידים חדשים מהקובץ`);
    };
    reader.readAsArrayBuffer(file);
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "2rem auto",
        padding: "0 1rem",
        paddingBottom: "100px",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        📈 מציאת לקוחות חדשים
      </h1>

      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="תחום (לדוגמה: עורך דין)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: "10px",
            flex: "1",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
        <input
          type="text"
          placeholder="עיר (לדוגמה: תל אביב)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            padding: "10px",
            flex: "1",
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
          }}
        >
          {loading ? "⏳ מחפש..." : "חפש"}
        </button>
        <button
          onClick={() => setShowCleanup(true)}
          style={{
            padding: "10px 20px",
            background: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          📱 ניקוי טלפונים
        </button>
      </div>

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
              <th>✔</th>
              <th>⭐</th>
              <th>שם עסק</th>
              <th>טלפון</th>
              <th>מייל</th>
              <th>כתובת</th>
              <th>קטגוריה</th>
              <th>סטטוס</th>
              <th>הערות</th>
              <th>תזמון שיחה</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", padding: "1rem" }}>
                  אין לידים להצגה.
                </td>
              </tr>
            ) : (
              leads.map((lead, i) => (
                <tr key={i}>
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => toggleFavorite(lead.id)}
                      style={{ background: "none", border: "none" }}
                    >
                      {favorites.includes(lead.id) ? "⭐" : "☆"}
                    </button>
                  </td>
                  <td>{lead.business_name}</td>
                  <td>
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
                  <td>
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`}>{lead.email}</a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{lead.address || "-"}</td>
                  <td>{lead.category || "-"}</td>
                  <td>
                    <select
                      value={statuses[lead.id] || lead.status || "חדש"}
                      onChange={(e) =>
                        setStatuses({ ...statuses, [lead.id]: e.target.value })
                      }
                    >
                      <option>חדש</option>
                      <option>בטיפול</option>
                      <option>נסגר</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="כתוב הערה..."
                      value={notes[lead.id] || lead.notes || ""}
                      onChange={(e) =>
                        setNotes({ ...notes, [lead.id]: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={callSchedule[lead.id] || lead.callSchedule || ""}
                      onChange={(e) =>
                        setCallSchedule({ ...callSchedule, [lead.id]: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleUpdate(lead.id)}
                      style={{
                        padding: "5px 10px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        marginRight: "5px",
                      }}
                    >
                      עדכון
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      style={{
                        padding: "5px 10px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      מחיקה
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        <button
          onClick={exportToExcel}
          style={{
            padding: "10px 20px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          ⬇️ יצוא לאקסל
        </button>
        <label
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ⬆️ יבוא מאקסל
          <input
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={importFromExcel}
          />
        </label>
      </div>

      {showCleanup && (
        <PhoneCleanupModal
          leads={leads}
          onClose={() => setShowCleanup(false)}
          onCleanup={(cleanedLeads) => {
            setLeads(cleanedLeads);
            saveLeadsToSupabase(cleanedLeads);
          }}
        />
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <BackButton />
      </div>
      <BottomNav />
    </div>
  );
}
