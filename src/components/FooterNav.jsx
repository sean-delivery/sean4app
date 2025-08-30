import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function FooterNav() {
  const [mounted, setMounted] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // לא מציגים בדף הקוביות ("/" או "/apps")
  const hideOnHome = pathname === "/" || pathname === "/apps";
  if (hideOnHome) return null;

  return createPortal(
    <footer className="app-bottom-nav" dir="rtl" data-role="bottom-nav" aria-label="ניווט תחתון">
      <a href="/apps/search" aria-label="חיפוש">🔎<span>חיפוש</span></a>
      <a href="/apps/customers" aria-label="לקוחות">📋<span>לקוחות</span></a>
      <a href="/apps/favs" aria-label="מעקב">⭐<span>מעקב</span></a>
      <a href="/apps/calendar" aria-label="יומן">🗓️<span>יומן</span></a>
      <a href="/apps" aria-label="חזרה">🏠<span>חזרה</span></a>
    </footer>,
    document.body
  );
}
