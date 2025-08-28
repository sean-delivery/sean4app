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
        background: "#1f2937",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 0",
        zIndex: 50,
      }}
    >
      <button onClick={() => navigate("/apps/leads")} style={btnStyle}>🔍 חיפוש</button>
      <button onClick={() => navigate("/apps/clients")} style={btnStyle}>📋 לקוחות</button>
      <button onClick={() => navigate("/apps/watchlist")} style={btnStyle}>⭐ מעקב</button>
      <button onClick={() => navigate("/apps/calendar")} style={btnStyle}>📅 יומן</button>
      <button onClick={() => navigate("/apps")} style={btnStyle}>↩ חזרה</button>
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
