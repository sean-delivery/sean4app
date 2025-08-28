import { useNavigate } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#1f2937", // אפור כהה
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 0",
        zIndex: 50,
      }}
    >
      {/* חיפוש לידים */}
      <button onClick={() => navigate("/apps/leads")} style={btnStyle}>
        🔍 חיפוש
      </button>

      {/* טבלת לקוחות */}
      <button onClick={() => navigate("/apps/clients")} style={btnStyle}>
        📋 לקוחות
      </button>

      {/* רשימת מעקב */}
      <button onClick={() => navigate("/apps/watchlist")} style={btnStyle}>
        ⭐ מעקב
      </button>

      {/* יומן פגישות */}
      <button onClick={() => navigate("/apps/calendar")} style={btnStyle}>
        📅 יומן
      </button>

      {/* חזרה למסך הכניסה */}
      <button onClick={() => navigate("/apps")} style={btnStyle}>
        ↩ חזרה
      </button>
    </nav>
  );
}

const btnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
};
