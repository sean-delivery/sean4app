// src/pages/CalendarPage.tsx
import React from "react";
import CalendarManager from "./CalendarManager"; 
import BottomNav from "../components/BottomNav";
import BackButton from "../components/BackButton";

export default function CalendarPage() {
  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "1rem",
        paddingBottom: "100px",
      }}
    >
      {/* יומן פגישות */}
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        📅 יומן פגישות
      </h1>

      {/* מנהל היומן עצמו */}
      <CalendarManager onNavigate={() => window.history.back()} />

      {/* כפתור חזרה */}
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <BackButton />
      </div>

      {/* סרגל תחתון */}
      <BottomNav />
    </div>
  );
}
