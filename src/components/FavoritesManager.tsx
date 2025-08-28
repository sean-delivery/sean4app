import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import BackButton from "./BackButton";
import BottomNav from "./BottomNav";

export default function FavoritesManager() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("is_favorite", true) // 👈 רק מי שסומן ככוכב
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ שגיאה בטעינת פייבוריט:", error);
      setFavorites([]);
    } else {
      setFavorites(data || []);
    }
    setLoading(false);
  }

  async function toggleFavorite(id: string, value: boolean) {
    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: value })
      .eq("id", id);

    if (error) {
      console.error("❌ שגיאה בעדכון פייבוריט:", error);
    } else {
      loadFavorites();
    }
  }

  async function deleteLead(id: string) {
    if (!window.confirm("למחוק את הליד הזה מהמועדפים?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      console.error("❌ שגיאה במחיקה:", error);
    } else {
      setFavorites((prev) => prev.filter((f) => f.id !== id));
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
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>⭐ מעקב אישי</h1>

      {loading ? (
        <p style={{ textAlign: "center" }}>⏳ טוען...</p>
      ) : favorites.length === 0 ? (
        <p style={{ textAlign: "center" }}>אין פייבוריטים להצגה</p>
      ) : (
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
              <th>⭐</th>
              <th>שם עסק</th>
              <th>טלפון</th>
              <th>מייל</th>
              <th>כתובת</th>
              <th>קטגוריה</th>
              <th>סטטוס</th>
              <th>הערות</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map((f) => (
              <tr key={f.id}>
                <td style={{ textAlign: "center" }}>
                  <button
                    onClick={() => toggleFavorite(f.id, false)}
                    style={{ background: "none", border: "none" }}
                  >
                    ⭐
                  </button>
                </td>
                <td>{f.business_name}</td>
                <td>{f.phone}</td>
                <td>{f.email || "-"}</td>
                <td>{f.address || "-"}</td>
                <td>{f.category || "-"}</td>
                <td>{f.status || "חדש"}</td>
                <td>{f.notes || ""}</td>
                <td>
                  <button
                    onClick={() => deleteLead(f.id)}
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
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <BackButton />
      </div>
      <BottomNav />
    </div>
  );
}
