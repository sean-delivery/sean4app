import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

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
      options: { redirectTo: window.location.origin },
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

  // מסך התחברות
  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Segoe UI, sans-serif",
          textAlign: "center",
          background: "#f9fafb",
        }}
      >
        <div style={{ maxWidth: "400px", width: "100%", padding: "20px" }}>
          <h1 style={{ marginBottom: "10px" }}>S'ean Apps</h1>
          <p style={{ marginBottom: "20px" }}>כדי להמשיך – התחבר עכשיו</p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              width: "100%",
            }}
          >
            <button
              onClick={loginWithGoogle}
              style={{
                padding: "12px",
                background: "#ea4335",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              התחברות עם Google
            </button>

            <button
              onClick={loginWithEmail}
              style={{
                padding: "12px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              הרשמה / כניסה ידנית
            </button>
          </div>

          <p style={{ marginTop: "40px", fontSize: "13px", color: "#555" }}>
            © כל הזכויות שמורות לנחמני שון
          </p>
        </div>
      </div>
    );
  }

  // מסך כשהמשתמש מחובר
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Segoe UI, sans-serif",
        textAlign: "center",
        background: "#f9fafb",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "800px", width: "100%" }}>
        <h1 style={{ marginBottom: "10px" }}>עכשיו אני מתחיל לייצר כסף 🚀</h1>
        <p style={{ marginBottom: "20px" }}>
          4 אפליקציות במקום אחד – הדרך שלך לצמיחה מהירה!
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "15px",
          }}
        >
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
          style={{
            marginTop: "30px",
            padding: "12px 20px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          התנתקות
        </button>

        <p style={{ marginTop: "40px", fontSize: "13px", color: "#555" }}>
          © כל הזכויות שמורות לנחמני שון
        </p>
      </div>
    </div>
  );
}
