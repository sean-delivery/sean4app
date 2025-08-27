import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

export default function App() {
  const [user, setUser] = useState(null)

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
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontFamily: "Segoe UI"
      }}>
        <h1>S'ean Apps</h1>
        <p>כדי להמשיך – התחבר עכשיו</p>
        <div>
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

        <footer style={{
          marginTop: "40px",
          fontSize: "14px",
          color: "#555"
        }}>
          © כל הזכויות שמורות לנחמני שון
        </footer>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      fontFamily: "Segoe UI"
    }}>
      <h1>עכשיו אני מתחיל לייצר כסף 🚀</h1>
      <p>4 אפליקציות במקום אחד – הדרך שלך לצמיחה מהירה!</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", padding: "20px", maxWidth: "600px" }}>
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

      <footer style={{
        marginTop: "40px",
        fontSize: "14px",
        color: "#555"
      }}>
        © כל הזכויות שמורות לנחמני שון
      </footer>
    </div>
  );
}
