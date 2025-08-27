import React from "react";

type Lead = {
  id?: string;
  business_name: string;
  phone: string;
  address: string;
  website?: string;
  category?: string;
};

interface LeadsTableProps {
  leads: Lead[];
}

/**
 * טבלת לידים – מותאם גם לניידים וגם לדסקטופ
 */
export default function LeadsTable({ leads }: LeadsTableProps) {
  if (!leads || leads.length === 0) {
    return (
      <p
        style={{
          textAlign: "center",
          marginTop: "1rem",
          color: "#555",
        }}
      >
        אין לידים להצגה.
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto", marginTop: "1rem" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          fontSize: "14px",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
            <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              שם עסק
            </th>
            <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              טלפון
            </th>
            <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              כתובת
            </th>
            <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              אתר
            </th>
            <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              קטגוריה
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => (
            <tr key={lead.id || i}>
              <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                {lead.business_name}
              </td>
              <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                {lead.phone || "-"}
              </td>
              <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                {lead.address || "-"}
              </td>
              <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                {lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2563eb", textDecoration: "underline" }}
                  >
                    לאתר
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                {lead.category || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
