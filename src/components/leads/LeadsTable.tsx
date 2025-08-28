import React, { useState } from "react";
import * as XLSX from "xlsx";

interface Lead {
  id: string;
  business_name: string;
  phone?: string;
  email?: string;
  address?: string;
  category?: string;
  notes?: string;
  status?: string;
  callSchedule?: string;
}

interface Props {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const LeadsTable: React.FC<Props> = ({ leads, setLeads }) => {
  const [selected, setSelected] = useState<string[]>([]);

  // ✅ מחיקת כפילויות לפי טלפון או שם עסק
  const removeDuplicates = (items: Lead[]) => {
    const seen = new Map<string, Lead>();
    items.forEach((lead) => {
      const key = lead.phone || lead.business_name;
      if (key && !seen.has(key)) {
        seen.set(key, lead);
      }
    });
    return Array.from(seen.values());
  };

  // ✅ יצוא לאקסל
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(leads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "לקוחות");
    XLSX.writeFile(workbook, "leads_backup.xlsx");
  };

  // ✅ ייבוא מאקסל
  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const imported: Lead[] = XLSX.utils.sheet_to_json(sheet);

      // מחיקת כפילויות
      const merged = removeDuplicates([...leads, ...imported]);
      setLeads(merged);
      alert(`✅ נוספו ${merged.length - leads.length} לידים חדשים מהקובץ`);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      {/* כפתורי גיבוי */}
      <div style={{ margin: "10px 0", display: "flex", gap: "10px" }}>
        <button
          onClick={exportToExcel}
          style={{ padding: "8px 16px", background: "#2563eb", color: "white", borderRadius: "6px" }}
        >
          📤 יצוא לאקסל
        </button>

        <label
          style={{ padding: "8px 16px", background: "#10b981", color: "white", borderRadius: "6px", cursor: "pointer" }}
        >
          📥 ייבוא מאקסל
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={importFromExcel}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* טבלת הלקוחות */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th>✔</th>
            <th>שם עסק</th>
            <th>טלפון</th>
            <th>מייל</th>
            <th>כתובת</th>
            <th>קטגוריה</th>
            <th>סטטוס</th>
            <th>הערות</th>
            <th>תזמון שיחה</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: "center", padding: "1rem" }}>
                אין לידים להצגה.
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(lead.id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(lead.id)
                          ? prev.filter((id) => id !== lead.id)
                          : [...prev, lead.id]
                      )
                    }
                  />
                </td>
                <td>{lead.business_name}</td>
                <td>{lead.phone || "-"}</td>
                <td>{lead.email || "-"}</td>
                <td>{lead.address || "-"}</td>
                <td>{lead.category || "-"}</td>
                <td>{lead.status || "חדש"}</td>
                <td>{lead.notes || ""}</td>
                <td>{lead.callSchedule || ""}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;
