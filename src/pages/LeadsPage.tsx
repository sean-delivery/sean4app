import { useEffect, useState } from "react";
import { getLeads, searchLeads, saveLeadsToSupabase } from "../lib/leadService";
import BackButton from "../components/BackButton";
import BottomNav from "../components/BottomNav";
import PhoneCleanupModal from "../components/leads/PhoneCleanupModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [callSchedule, setCallSchedule] = useState<{ [key: string]: string }>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [showCleanup, setShowCleanup] = useState(false);

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

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  /* ===== ייצוא לאקסל ===== */
  function exportToExcel() {
    if (leads.length === 0) {
      alert("אין נתונים לייצוא");
      return;
    }

    // כותרות בארבע שפות
    const header = [
      ["שם עסק", "Business Name", "اسم الشركة", "Название бизнеса"],
      ["טלפון", "Phone", "هاتف", "Телефон"],
      ["מייל", "Email", "بريد إلكتروني", "Эл. почта"],
      ["כתובת", "Address", "عنوان", "Адрес"],
      ["קטגוריה", "Category", "فئة", "Категория"],
      ["סטטוס", "Status", "الحالة", "Статус"],
      ["הערות", "Notes", "ملاحظات", "Заметки"],
      ["תזמון שיחה", "Call Schedule", "جدولة مكالمات", "График звонков"]
    ];

    // בניית הנתונים
    const data = leads.map((lead) => [
      lead.business_name || "",
      lead.phone || "",
      lead.email || "",
      lead.address || "",
      lead.category || "",
      lead.status || "",
      lead.notes || "",
      lead.callSchedule || ""
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header.map((h) => h[0]), ...data]); // בעברית ככותרות
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "leads_backup.xlsx");
  }

  /* ===== ייבוא מאקסל ===== */
  function importFromExcel(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const importedData: any[] = XLSX.utils.sheet_to_json(sheet);

      // מניעת כפילויות לפי שם עסק + טלפון
      const newLeads = importedData
        .filter(
          (row: any) =>
            !leads.some(
              (lead) =>
                lead.business_name === row["שם עסק"] &&
                lead.phone === row["טלפון"]
            )
        )
        .map((row) => ({
          business_name: row["שם עסק"] || "",
          phone: row["טלפון"] || "",
          email: row["מייל"] || "",
          address: row["כתובת"] || "",
          category: row["קטגוריה"] || "",
          status: row["סטטוס"] || "חדש",
          notes: row["הערות"] || "",
          callSchedule: row["תזמון שיחה"] || ""
        }));

      setLeads((prev) => [...prev, ...newLeads]);
      alert(`✅ נוספו ${newLeads.length} לידים חדשים מהקובץ`);
    };
    reader.readAsArrayBuffer(file);
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "2rem auto", padding: "0 1rem", paddingBottom: "100px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        📈 מציאת לקוחות חדשים
      </h1>

      {/* שורת החיפוש */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "10px", justifyContent: "center" }}>
        <input
          type="text"
          placeholder="הכנס מילת חיפוש (לדוגמה: עורך דין תל אביב)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "10px", flex: "1", minWidth: "250px", border: "1px solid #ccc", borderRadius: "6px" }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{ padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px" }}
        >
          {loading ? "⏳ מחפש..." : "חפש"}
        </button>
        <button
          onClick={() => setShowCleanup(true)}
          style={{ padding: "10px 20px", background: "#f59e0b", color: "white", border: "none", borderRadius: "6px" }}
        >
          📱 ניקוי טלפונים
        </button>
      </div>

      {/* כותרת עליונה לטבלת תוצאות */}
      <h2 style={{ textAlign: "right", margin: "1rem 0", fontSize: "20px", fontWeight: "bold" }}>
        📋 תוצאות החיפוש שלך
      </h2>

      {/* טבלה של לידים */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>✔</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>⭐</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>שם עסק</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>טלפון</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>מייל</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>כתובת</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>קטגוריה</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>סטטוס</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>הערות</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>תזמון שיחה</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", padding: "1rem" }}>אין לידים להצגה.</td>
              </tr>
            ) : (
              leads.map((lead: any, i: number) => (
                <tr key={i}>
                  {/* בחירה מרובה */}
                  <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                    <input type="checkbox" checked={selected.includes(lead.id)} onChange={() => toggleSelect(lead.id)} />
                  </td>

                  {/* מועדפים */}
                  <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                    <button
                      onClick={() => toggleFavorite(lead.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
                    >
                      {favorites.includes(lead.id) ? "⭐" : "☆"}
                    </button>
                  </td>

                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{lead.business_name}</td>

                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {lead.phone ? (
                      <>
                        <a href={`tel:${lead.phone}`}>{lead.phone}</a> |{" "}
                        <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">וואטסאפ</a>
                      </>
                    ) : "-"}
                  </td>

                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "-"}
                  </td>

                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{lead.address || "-"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{lead.category || "-"}</td>

                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <select
                      value={statuses[lead.id] || "חדש"}
                      onChange={(e) => setStatuses({ ...statuses, [lead.id]: e.target.value })}
                    >
                      <option>חדש</option>
                      <option>בטיפול</option>
                      <option>נסגר</option>
                    </select>
                  </td>

                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <input
                      type="text"
                      placeholder="כתוב הערה..."
                      value={notes[lead.id] || ""}
                      onChange={(e) => setNotes({ ...notes, [lead.id]: e.target.value })}
                      style={{ width: "100%" }}
                    />
                  </td>

                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <input
                      type="date"
                      value={callSchedule[lead.id] || ""}
                      onChange={(e) => setCallSchedule({ ...callSchedule, [lead.id]: e.target.value })}
                    />
                  </td>

                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <button
                      onClick={() => alert(`📞 יוצר קשר עם ${lead.business_name}`)}
                      style={{ padding: "5px 10px", background: "#10b981", color: "white", border: "none", borderRadius: "4px" }}
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

      {/* כפתורי ייבוא/ייצוא */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
        <button
          onClick={exportToExcel}
          style={{ padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          ⬇️ יצוא לאקסל
        </button>

        <label
          style={{ padding: "10px 20px", background: "#3b82f6", color: "white", borderRadius: "6px", cursor: "pointer" }}
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

      {/* מודאל לניקוי טלפונים */}
      {showCleanup && (
        <PhoneCleanupModal
          leads={leads}
          onClose={() => setShowCleanup(false)}
          onCleanup={(cleanedLeads) => setLeads(cleanedLeads)}
        />
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <BackButton />
      </div>

      {/* סרגל תחתון */}
      <BottomNav />
    </div>
  );
}
