import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import ChatBot from "./ChatBot";
import LeadsPage from "./pages/LeadsPage"; // ⬅️ הוסף למעלה
import GoogleAPISearch from "./pages/GoogleAPISearch"; // ✅ חיבור חדש
import "./App.css";

/* ===== Header ===== */
function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="logo">S'ean Apps</div>
      <div>
        {user?.email && <span className="user-email">מחובר כ־ {user.email}</span>}
        <button onClick={onLogout} className="logout-btn">
          התנתקות
        </button>
      </div>
    </header>
  );
}

/* ===== Footer ===== */
function Footer() {
  return <footer className="footer">© כל הזכויות שמורות לנחמני שון</footer>;
}

/* ===== Placeholder כללי לשאר האפליקציות ===== */
function Placeholder({ title }) {
  const navigate = useNavigate();
  return (
    <div className="placeholder">
      <h2>{title}</h2>
      <p>תוכן יופיע כאן בהמשך...</p>
      <button onClick={() => navigate("/apps")} className="back-btn">
        חזרה לאפליקציות
      </button>
    </div>
  );
}

/* ===== Apps Page ===== */
function AppsPage() {
  const navigate = useNavigate();

  return (
    <div className="apps-container">
      <h1>עכשיו אני מתחיל לייצר כסף 🚀</h1>
      <p className="slogan">הדרך שלך לצמיחה מהירה</p>

      <div className="apps-grid">
        <button onClick={() => navigate("/apps/leads")} className="cube">
          📈 מציאת לקוחות חדשים
        </button>
        <button onClick={() => navigate("/apps/cashflow")} className="cube">
          💰 תזרים מזומנים + יועץ עסקי AI
        </button>
        <button onClick={() => navigate("/apps/warehouse")} className="cube">
          📦 ניהול מחסן אישי
        </button>
        <button onClick={() => navigate("/apps/marketing")} className="cube">
          📢 שיווק חכם + יועץ שיווקי AI
        </button>
        <button onClick={() => navigate("/apps/support")} className="cube-blue">
          📞 תמיכה והתקשרות
        </button>
        <button
          onClick={() => window.open("https://wa.me/972586177022", "_blank")}
          className="cube-blue"
        >
          🚚 מחשבון משלוחים והובלות לכל הארץ
        </button>
        <button onClick={() => navigate("/apps/chatbot")} className="cube">
          🤖 בוט שירות לקוחות
        </button>
      </div>
    </div>
  );
}

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

  if (loading) return <p className="loading">טוען...</p>;

  if (!user) {
    return (
      <div className="login-screen">
        <h1>S'ean Apps</h1>
        <p>כדי להמשיך – התחבר עכשיו</p>
        <button onClick={loginWithGoogle} className="google-btn">
          התחברות עם Google
        </button>
        <button onClick={loginWithEmail} className="email-btn">
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

  {/* כאן השינוי */}
  <Route path="/apps/leads" element={<GoogleAPISearch />} />

  <Route path="/apps/cashflow" element={<Placeholder title="תזרים מזומנים + יועץ עסקי AI" />} />
  <Route path="/apps/warehouse" element={<Placeholder title="ניהול מחסן אישי" />} />
  <Route path="/apps/marketing" element={<Placeholder title="שיווק חכם + יועץ שיווקי AI" />} />
  <Route path="/apps/support" element={<Placeholder title="תמיכה והתקשרות" />} />
  <Route path="/apps/chatbot" element={<ChatBot />} />
</Routes>
      <Footer />
    </Router>
  );
}
