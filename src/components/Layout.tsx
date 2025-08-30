// src/components/Layout.tsx
import Header from "./Header";
import BottomNav from "./BottomNav";
import * as React from "react";

type LayoutProps = {
  children: React.ReactNode;
  /** משתמש מחובר (בעתיד אפשר להרחיב עם role וכו') */
  user?: { email?: string; role?: "admin" | "user" | "guest" } | null;
  /** פעולה להתנתקות (אם קיימת) */
  onLogout?: () => void;
  /** אם true – נציג תוכן התחברות כשאין משתמש (לא חובה כרגע) */
  requireAuth?: boolean;
};

export default function Layout({
  children,
  user,
  onLogout,
  requireAuth = false,
}: LayoutProps) {
  const isAuthed = !!user;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ✅ פס כחול קבוע למעלה */}
      {/* cast קטן כדי לא לשבור את Header אם הוא מצפה ל-props חובה */}
      <Header {...({ user, onLogout } as any)} />

      {/* תוכן העמוד */}
      <main style={{ flex: 1, paddingTop: "20px" }}>
        {requireAuth && !isAuthed ? (
          <div style={{ padding: "16px", textAlign: "center" }}>
            <h2>נדרש להתחבר</h2>
            <p>אין משתמש מחובר כרגע. המשך יסופק אחרי התחברות.</p>
            {/* כאן בעתיד אפשר לשים כפתור ניווט /login */}
          </div>
        ) : (
          children
        )}
      </main>

      {/* ✅ סרגל תחתון קבוע – מוצג תמיד (או תחליט לפי isAuthed) */}
      <BottomNav />
    </div>
  );
}
