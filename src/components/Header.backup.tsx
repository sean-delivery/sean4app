import React from "react";

export default function Header({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <header
      style={{
        background: "#374151", // אפור כהה - כמו התחתון
        color: "white",
        height: "50px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 1rem",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "16px" }}>sean4app</div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {user?.email && (
          <span style={{ fontSize: "14px", whiteSpace: "nowrap" }}>{user.email}</span>
        )}
        <button
          style={{
            background: "#10b981", // ירוק כפתור מתנה
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🎁 מתנה
        </button>
        <button
          onClick={onLogout}
          style={{
            background: "#ef4444", // אדום התנתקות
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🔒 התנתקות
        </button>
      </div>
    </header>
  );
}
