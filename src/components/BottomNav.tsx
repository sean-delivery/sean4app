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
      {/* חיפוש גוגל */}
      <button
        onClick={() => navigate("/google-search")}
        style={btnStyle}
      >
        🔍 חיפוש
      </button>

      {/* טבלת לקוחות */}
      <button
        onClick={() => navigate("/clients")}
        style={btnStyle}
      >
        📋 לקוחות
      </button>

      {/* רשימת מעקב */}
      <button
        onClick={() => navigate("/watchlist")}
        style={btnStyle}
      >
        ⭐ מעקב
      </button>

      {/* Google Calendar */}
      <button
        onClick={() => navigate("/calendar")}
        style={btnStyle}
      >
        📅 יומן
      </button>

      {/* חזרה למסך הכניסה */}
      <button
        onClick={() => navigate("/apps")}
        style={btnStyle}
      >
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
