import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";


/* ===== Header ===== */
function Header({ user, onLogout }) {
  return (
    <header
      style={{
        width: "100%",
        padding: "15px 25px",
        background: "#2563eb",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "18px" }}>S'ean Apps</div>
      <div>
        {user?.email && (
          <span style={{ marginRight: "20px", fontSize: "14px" }}>
            מחובר כ־ {user.email}
          </span>
        )}
        <button
          onClick={onLogout}
          style={{
            padding: "8px 16px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          התנתקות
        </button>
      </div>
    </header>
  );
}

/* ===== Footer ===== */
function Footer() {
  return (
    <footer
      style={{
        marginTop: "40px",
        textAlign: "center",
        fontSize: "13px",
        color: "#555",
        padding: "15px 0",
      }}
    >
      © כל הזכויות שמורות לנחמני שון
    </footer>
  );
}

/* ===== Placeholder ===== */
function Placeholder({ title }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2>{title}</h2>
      <p style={{ marginBottom: "20px" }}>תוכן יופיע כאן בהמשך...</p>
      <button
        onClick={() => navigate("/apps")}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "15px",
        }}
      >
        חזרה לאפליקציות
      </button>
    </div>
  );
}

/* ===== Apps Page ===== */
function AppsPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "10px", fontSize: "28px" }}>
        עכשיו אני מתחיל לייצר כסף 🚀
      </h1>
      <p style={{ marginBottom: "30px", fontSize: "16px", color: "#444" }}>
        4 באחד – הדרך שלך לצמיחה מהירה!
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          width: "100%",
          maxWidth: "1000px",
        }}
      >
        {/* 4 אפליקציות עיקריות */}
        <button onClick={() => navigate("/apps/leads")} style={cubeStyle}>
          📈 מציאת לקוחות חדשים
        </button>
        <button onClick={() => navigate("/apps/cashflow")} style={cubeStyle}>
          💰 תזרים מזומנים + יועץ עסקי AI
        </button>
        <button onClick={() => navigate("/apps/warehouse")} style={cubeStyle}>
          📦 ניהול מחסן אישי
        </button>
        <button onClick={() => navigate("/apps/marketing")} style={cubeStyle}>
          📢 שיווק חכם + יועץ שיווקי AI
        </button>

        {/* 2 קוביות נוספות עם גבול תכלת */}
        <button onClick={() => navigate("/apps/support")} style={cubeBlue}>
          📞 תמיכה והתקשרות
        </button>
        <button
          onClick={() => window.open("https://wa.me/972586177022", "_blank")}
          style={cubeBlue}
        >
          🚚 מחשבון משלוחים והובלות לכל הארץ
        </button>
      </div>
    </div>
  );
}

/* ===== עיצוב לקוביות ===== */
const cubeStyle = {
  background: "#fff",
  padding: "25px 20px",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  transition: "all 0.3s ease",
  textAlign: "center",
};
const cubeBlue = {
  ...cubeStyle,
  border: "2px solid #2563eb",
};
Object.assign(cubeStyle, {
  ":hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
  },
});

/* ===== App Component ===== */
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

  /* ===== מסך התחברות ===== */
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

  /* ===== מסך ראשי אחרי התחברות ===== */
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
