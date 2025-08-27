import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) alert(error.message);
  }

  async function loginWithEmail() {
    const email = prompt("הכנס אימייל:");
    const password = prompt("הכנס סיסמה:");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else setUser(data.user);
  }

  function logout() {
    supabase.auth.signOut();
    setUser(null);
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center w-full max-w-md">
          <h1 className="text-3xl font-bold text-indigo-700 mb-4">S'ean Apps</h1>
          <p className="text-gray-600 mb-6">כדי להמשיך – התחבר עכשיו</p>
          <button
            onClick={loginWithGoogle}
            className="w-full py-2 mb-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            התחברות עם Google
          </button>
          <button
            onClick={loginWithEmail}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            הרשמה / כניסה ידנית
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-2">עכשיו אני מתחיל לייצר כסף 🚀</h1>
      <p className="text-gray-600 mb-8">4 אפליקציות במקום אחד – הדרך שלך לצמיחה מהירה!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">📈 אפליקציה 1 – מציאת לקוחות חדשים</div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">💰 אפליקציה 2 – תזרים מזומנים + יועץ עסקי AI</div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">📦 אפליקציה 3 – ניהול מחסן אישי</div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">📢 אפליקציה 4 – שיווק חכם + יועץ שיווקי AI</div>
      </div>

      <button
        onClick={logout}
        className="mt-10 px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
      >
        התנתקות
      </button>
    </div>
  );
}
