// src/pages/ResultsPage.tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import BackButton from "../components/BackButton";
import BottomNav from "../components/BottomNav"; // ✅ פס תחתון אחיד

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
  external_id?: string;
  updated_at?: string;
};

export default function ResultsPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const source = params.get("source") || "";
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      try {
        const query = supabase.from("leads").select("*").eq("source", source);

        // סדר לפי עדכון אם יש עמודה
        query.order("updated_at", { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        setLeads(data || []);
      } catch (err) {
        console.error("❌ getResults error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (source) fetchLeads();
  }, [source]);

  return (
    <>
      <div
        style={{
          maxWidth: "1100px",
          margin: "70px auto 70px",
          padding: "1rem", // ✅ ריווח מותאם לפס עליון ותחתון
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "1rem",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          📊 תוצאות חיפוש
        </h1>

        {loading ? (
          <p style={{ textAlign: "center" }}>⏳ טוען...</p>
        ) : leads.length === 0 ? (
          <p style={{ textAlign: "center" }}>אין תוצאות להצגה.</p>
        ) : (
          <div className="card" style={{ overflowX: "auto" }}>
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
                  <th>כתובת</th>
                  <th>קטגוריה</th>
                  <th>סטטוס</th>
                  <th>הערות</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.business_name || "-"}</td>
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
                    <td>{lead.status || "חדש"}</td>
                    <td>{lead.notes || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          className="card"
          style={{ marginTop: "2rem", textAlign: "center" }}
        >
          <BackButton />
        </div>
      </div>

      <BottomNav /> {/* ✅ פס אפור כהה למטה */}
    </>
  );
}
