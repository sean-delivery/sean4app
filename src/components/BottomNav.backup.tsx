import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "50px",
        background: "#374151",
        color: "white",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        fontSize: "14px",
        zIndex: 1000,
        boxShadow: "0 -2px 6px rgba(0,0,0,0.2)",
      }}
    >
      <button
        onClick={() => navigate("/apps/leads")}
        style={{
          background: "none",
          border: "none",
          color: isActive("/apps/leads") ? "#3b82f6" : "white",
          fontWeight: isActive("/apps/leads") ? "bold" : "normal",
          cursor: "pointer",
        }}
      >
        🔍 חיפוש
      </button>

      <button
        onClick={() => navigate("/apps/leads/results")}
        style={{
          background: "none",
          border: "none",
          color: isActive("/apps/leads/results") ? "#3b82f6" : "white",
          fontWeight: isActive("/apps/leads/results") ? "bold" : "normal",
          cursor: "pointer",
        }}
      >
        📋 לקוחות
      </button>

      <button
        onClick={() => navigate("/apps/tracking")}
        style={{
          background: "none",
          border: "none",
          color: isActive("/apps/tracking") ? "#facc15" : "white",
          fontWeight: isActive("/apps/tracking") ? "bold" : "normal",
          cursor: "pointer",
        }}
      >
        ⭐ מעקב
      </button>

      <button
        onClick={() => navigate("/apps/calendar")}
        style={{
          background: "none",
          border: "none",
          color: isActive("/apps/calendar") ? "#10b981" : "white",
          fontWeight: isActive("/apps/calendar") ? "bold" : "normal",
          cursor: "pointer",
        }}
      >
        📅 יומן
      </button>

      <button
        onClick={() => navigate("/apps")}
        style={{
          background: "none",
          border: "none",
          color: isActive("/apps") ? "#ef4444" : "white",
          fontWeight: isActive("/apps") ? "bold" : "normal",
          cursor: "pointer",
        }}
      >
        ↩️ חזרה
      </button>
    </nav>
  );
}
