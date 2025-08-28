// src/components/BottomNav.tsx
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#1f2937",
        color: "white",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0",
        fontSize: "14px",
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => navigate("/apps/leads")}
        style={{
          background: "none",
          border: "none",
          color: isActive("/apps/leads") ? "#3b82f6" : "white",
          fontWeight: isActive("/apps/leads") ? "bold" : "normal",
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
        }}
      >
        ↩️ חזרה
      </button>
    </nav>
  );
}
