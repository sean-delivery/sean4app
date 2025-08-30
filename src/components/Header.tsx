import { useNavigate } from "react-router-dom";

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        background: "#374151", // אפור כהה
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
        color: "#f9fafb",
        fontSize: "14px",
        fontWeight: "bold",
        zIndex: 1000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
    >
      {/* לוגו */}
      <div
        style={{ cursor: "pointer", color: "#60a5fa", fontSize: "16px" }}
        onClick={() => navigate("/apps")}
      >
        sean4app
      </div>

      {/* אימייל מחובר */}
      {user?.email && (
        <div
          style={{
            fontSize: "13px",
            margin: "0 1rem",
            whiteSpace: "nowrap",
          }}
        >
          {user.email}
        </div>
      )}

      {/* כפתורים */}
      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={() => navigate("/apps")}
          style={{
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          🎁 מתנה
        </button>
        <button
          onClick={onLogout}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          🔒 התנתקות
        </button>
      </div>
    </header>
  );
}
