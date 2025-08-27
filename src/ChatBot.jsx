import { useState } from "react";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "שלום 👋 אני הבוט של S'ean Apps. איך אפשר לעזור לך היום?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
              אתה בוט שירות לקוחות ומכירות חכם של S'ean Apps.
              תפקידך לענות ללקוחות בעברית בלבד, להיות איש מכירות NLP, לזהות צרכים,
              להתגבר על התנגדויות ולהציע תמיד את מסלולי המכירה:
              - מסלול התנסות חינמי ("קח, תהנה, תרגיש ותתמכר לסדר ולצמיחה – בינתיים חינם!")
              - 1+1 ב־99 ₪ לחודש
              - 4 אפליקציות ב־198 ₪ לחודש (הכי משתלם)
              האפליקציות: מציאת לקוחות חדשים, תזרים מזומנים + יועץ עסקי AI, ניהול מחסן אישי,
              שיווק חכם + יועץ שיווקי AI, תמיכה והתקשרות, מחשבון משלוחים והובלות, בוט שירות לקוחות.
              תמיד תסיים שיחה בהצעת מסלול.
              `,
            },
            ...newMessages,
          ],
        }),
      });

      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content || "❌ שגיאה בתשובה";

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ שגיאה בשרת" },
      ]);
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
