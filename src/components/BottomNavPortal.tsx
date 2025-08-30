import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

function Bar() {
  return (
    <footer className="app-bottom-nav" dir="rtl" data-role="bottom-nav">
      <a href="/apps/search">חיפוש</a>
      <a href="/apps/customers">לקוחות</a>
      <a href="/apps/favs">מעקב</a>
      <a href="/apps/calendar">יומן</a>
      <a href="/apps">חזרה</a>
    </footer>
  );
}

export default function BottomNavPortal() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<Bar />, document.body);
}
