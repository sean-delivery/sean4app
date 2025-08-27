import { useState } from "react";
import { supabase } from "./supabaseClient"; // חיבור ל-Supabase

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "שלום 👋 איך אפשר לעזור?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // פונקציה לשמירת הודעה ב-Supabase
  async function saveMessage(role, content) {
    try {
      await supabase.from("chat_messages").insert([{ role, content }]);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  }

  // שליחת הודעה
  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // שמור את הודעת המשתמש
    await saveMessage("user", input);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: newMessages,
        }),
      });

      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content || "❌ שגיאה בתשובה";

      const assistantMessage = { role: "assistant", content: reply };
      setMessages([...newMessages, assistantMessage]);

      // שמור את תשובת הבוט
      await saveMessage("assistant", reply);
    } catch (err) {
      console.error(err);
      const errorMsg = { role: "assistant", content: "⚠️ שגיאה בשרת" };
      setMessages([...newMessages, errorMsg]);

      await saveMessage("assistant", "⚠️ שגיאה בשרת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        border: "1px solid #ddd",
        borderRadius: "12px",
        overflow: "hidden",
        fontFamily: "Segoe UI, sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "80vh",
      }}
    >
      {/* חלון הצ'אט */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          background: "#f9fafb",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: "12px",
              textAlign: msg.role === "user" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "10px 15px",
                borderRadius: "10px",
                background: msg.role === "user" ? "#2563eb" : "#e5e7eb",
                color: msg.role === "user" ? "white" : "black",
                maxWidth: "80%",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <p>⏳ מחכה לתשובה...</p>}
      </div>

      {/* שורת קלט */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #ddd",
          padding: "10px",
          background: "#fff",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
          placeholder="כתוב הודעה..."
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          שלח
        </button>
      </div>
    </div>
  );
}
