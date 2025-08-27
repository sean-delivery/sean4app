import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// יצירת חיבור ל-Supabase מה-Environment Variables
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) alert(error.message);
  }

  async function loginWithEmail() {
    const email = prompt("הכנס אימייל:");
    const password = prompt("הכנס סיסמה:");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else setUser(data.user);
  }

  function logout() {
    supabase.auth.signOut();
    setUser(null);
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px", fontFamily: "Segoe UI" }}>
        <h1>S'ean Apps</h1>
        <p>כדי להמשיך – התחבר עכשיו</p>
        <button
          onClick={loginWithGoogle}
          style={{ padding: "10px 20px", margin: "10px", background: "#ea4335", color: "white", border: "none", borderRadius: "6px" }}
        >
          התחברות עם Google
        </button>
        <button
          onClick={loginWithEmail}
          style={{ padding: "10px 20px", margin: "10px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px" }}
        >
          הרשמה / כניסה ידנית
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", fontFamily: "Segoe UI" }}>
      <h1>עכשיו אני מתחיל לייצר כסף 🚀</h1>
      <p>4 אפליקציות במקום אחד – הדרך שלך לצמיחה מהירה!</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", padding: "20px" }}>
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          📈 אפליקציה 1 – מציאת לקוחות חדשים
        </div>
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          💰 אפליקציה 2 – תזרים מזומנים + יועץ עסקי AI
        </div>
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          📦 אפליקציה 3 – ניהול מחסן אישי
        </div>
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          📢 אפליקציה 4 – שיווק חכם + יועץ שיווקי AI
        </div>
      </div>

      <button
        onClick={logout}
        style={{ marginTop: "20px", padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px" }}
      >
        התנתקות
      </button>
    </div>
  );
}
