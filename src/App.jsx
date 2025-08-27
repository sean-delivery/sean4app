import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";

function Header({ user, onLogout }) {
  return (
    <header
      style={{
        width: "100%",
        padding: "10px 20px",
        background: "#2563eb",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      <div>S'ean Apps</div>
      <div>
        {user?.email && (
          <span style={{ marginRight: "15px" }}>מחובר כ־ {user.email}</span>
        )}
        <button
          onClick={onLogout}
          style={{
            padding: "6px 12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          התנתקות
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        marginTop: "40px",
        textAlign: "center",
        fontSize: "13px",
        color: "#555",
      }}
    >
      © כל הזכויות שמורות לנחמני שון
    </footer>
  );
}

function Placeholder({ title }) {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>{title}</h2>
      <p>תוכן יופיע כאן בהמשך...</p>
      <button
        onClick={() => navigate("/apps")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        חזרה לאפליקציות
      </button>
    </div>
  );
}

function AppsPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "calc(100vh - 100px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1>עכשיו אני מתחיל לייצר כסף 🚀</h1>
      <p style={{ marginBottom: "30px" }}>
        6 אפליקציות במקום אחד – הדרך שלך לצמיחה מהירה!
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          width: "100%",
          maxWidth: "1000px",
        }}
      >
        <button onClick={() => navigate("/apps/leads")} style={cubeStyle}>
          📈 אפליקציה 1 – מציאת לקוחות חדשים
        </button>
        <button onClick={() => navigate("/apps/cashflow")} style={cubeStyle}>
          💰 אפליקציה 2 – תזרים מזומנים + יועץ עסקי AI
        </button>
        <button onClick={() => navigate("/apps/warehouse")} style={cubeStyle}>
          📦 אפליקציה 3 – ניהול מחסן אישי
        </button>
        <button onClick={() => navigate("/apps/marketing")} style={cubeStyle}>
          📢 אפליקציה 4 – שיווק חכם + יועץ שיווקי AI
        </button>
        <button onClick={() => navigate("/apps/support")} style={cubeStyle}>
          📞 אפליקציה 5 – תמיכה והתקשרות
        </button>
        <button
          onClick={() => window.open("https://wa.me/972586177022", "_blank")}
          style={cubeStyle}
        >
          🚚 אפליקציה 6 – מחשבון משלוחים והובלות לכל הארץ
        </button>
      </div>
    </div>
  );
}

const cubeStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  border: "none",
  cursor: "pointer",
  fontSize: "15px",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
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

  if (loading) return <p style={{ textAlign: "center" }}>טוען...</p>;

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Segoe UI, sans-serif",
          background: "#f9fafb",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h1>S'ean Apps</h1>
        <p style={{ marginBottom: "20px" }}>כדי להמשיך – התחבר עכשיו</p>

        <button
          onClick={loginWithGoogle}
          style={{
            padding: "12px 24px",
            margin: "10px",
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
            padding: "12px 24px",
            margin: "10px",
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

        <Footer />
      </div>
    );
  }

  return (
    <Router>
      <Header user={user} onLogout={logout} />
      <Routes>
        <Route path="/" element={<Navigate to="/apps" />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/apps/leads" element={<Placeholder title="מציאת לקוחות חדשים" />} />
        <Route path="/apps/cashflow" element={<Placeholder title="תזרים מזומנים + יועץ עסקי AI" />} />
        <Route path="/apps/warehouse" element={<Placeholder title="ניהול מחסן אישי" />} />
        <Route path="/apps/marketing" element={<Placeholder title="שיווק חכם + יועץ שיווקי AI" />} />
        <Route path="/apps/support" element={<Placeholder title="תמיכה והתקשרות" />} />
      </Routes>
      <Footer />
    </Router>
  );
}
