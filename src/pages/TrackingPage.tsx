// src/pages/TrackingPage.tsx
import { useEffect, useState } from "react";
import {
  getSearches,
  getResultsBySearchId,
  deleteResultsBySearchId,
} from "../lib/searchService";
import BackButton from "../components/BackButton";
import BottomNav from "../components/BottomNav";

export default function TrackingPage() {
  const [searches, setSearches] = useState<any[]>([]);
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSearches() {
      const data = await getSearches();
      setSearches(data);
    }
    fetchSearches();
  }, []);

  async function loadResults(searchId: string) {
    setSelectedSearchId(searchId);
    const data = await getResultsBySearchId(searchId);
    setResults(data);
  }

  async function handleDeleteResults(searchId: string) {
    if (window.confirm("למחוק את כל התוצאות של החיפוש הזה?")) {
      await deleteResultsBySearchId(searchId);
      setResults([]);
      alert("✅ תוצאות החיפוש נמחקו");
    }
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
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>📊 מעקב חיפושים</h1>

      <div style={{ marginBottom: "2rem" }}>
        <h2>🔍 חיפושים אחרונים</h2>
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
              <th>מזהה</th>
              <th>מונח</th>
              <th>מקור</th>
              <th>כמות תוצאות</th>
              <th>תאריך</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {searches.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                  אין חיפושים להצגה.
                </td>
              </tr>
            ) : (
              searches.map((s, i) => (
                <tr key={i}>
                  <td>{s.id}</td>
                  <td>{s.term}</td>
                  <td>{s.source}</td>
                  <td>{s.total_results ?? s.results ?? "-"}</td>
                  <td>{new Date(s.executed_at).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => loadResults(s.id)}
                      style={{
                        padding: "5px 10px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        marginRight: "5px",
                      }}
                    >
                      צפייה בתוצאות
                    </button>
                    <button
                      onClick={() => handleDeleteResults(s.id)}
                      style={{
                        padding: "5px 10px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      מחיקת תוצאות
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedSearchId && (
        <div>
          <h2>📋 תוצאות החיפוש</h2>
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
                <th>כתובת</th>
                <th>דירוג</th>
                <th>כמות ביקורות</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                    אין תוצאות להצגה.
                  </td>
                </tr>
              ) : (
                results.map((r, i) => (
                  <tr key={i}>
                    <td>{r.business_name}</td>
                    <td>{r.phone}</td>
                    <td>{r.address}</td>
                    <td>{r.rating}</td>
                    <td>{r.reviews_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <BackButton />
      </div>
      <BottomNav />
    </div>
  );
}
