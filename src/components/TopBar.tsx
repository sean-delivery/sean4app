import { useNavigate } from "react-router-dom";

export default function TopBar() {
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "#374151", // ✅ אפור כהה תואם ל־BottomNav
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        zIndex: 1000,
        borderBottom: "2px solid #1f2937", // ✅ קו תחתון
      }}
    >
      {/* לוגו / שם האפליקציה */}
      <div
        onClick={() => navigate("/apps")}
        style={{ fontWeight: "bold", cursor: "pointer" }}
      >
        S'ean Apps
      </div>

      {/* אזור ימין – שם משתמש וכפתור */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <span style={{ fontSize: "14px", opacity: 0.8 }}>
          מחובר כ־seannon29@gmail.com
        </span>
        <button
          onClick={() => alert("🚪 התנתקת בהצלחה")}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          התנתקות
        </button>
      </div>
    </header>
  );
}
