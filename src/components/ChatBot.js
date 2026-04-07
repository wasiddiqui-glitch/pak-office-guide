"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const SUGGESTIONS = [
  "How do I renew my passport?",
  "What do I need for CNIC renewal?",
  "How to get a driving license?",
  "NADRA offices in Lahore",
  "How to get NICOP from abroad?",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const query = (text || input).trim();
    if (!query || loading) return;

    const userMessage = { role: "user", content: query };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.error ? "Sorry, something went wrong. Please try again." : data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again.", sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div style={windowStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>🇵🇰</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: 14, color: "#fff" }}>Office Guide Assistant</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>Answers from our own database</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={closeBtnStyle} aria-label="Close chat">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={messagesStyle}>
            {messages.length === 0 && (
              <div style={welcomeStyle}>
                <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: "#334155" }}>
                  Ask about any Pakistani government procedure:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} style={suggestionStyle}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={msg.role === "user" ? userBubble : botBubble}>{msg.content}</div>

                {msg.sources?.length > 0 && (
                  <div style={sourcesStyle}>
                    <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, fontWeight: 700, letterSpacing: 0.5 }}>
                      SOURCES
                    </div>
                    {msg.sources.map((src, j) => (
                      <Link
                        key={j}
                        href={
                          src.type === "guide"
                            ? `/guides/${src.slug}`
                            : src.type === "embassy"
                            ? `/overseas/embassy/${src.id}`
                            : `/office/${src.id}`
                        }
                        onClick={() => setOpen(false)}
                        style={sourceChipStyle}
                      >
                        <span style={{ fontSize: 13 }}>
                          {src.type === "guide" ? src.emoji || "📋" : src.type === "embassy" ? "🌍" : "🏢"}
                        </span>
                        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {src.type === "guide" ? src.title : `${src.name} — ${src.city}`}
                        </span>
                        <span style={{ color: "#0b6b3a", fontSize: 12 }}>→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ ...botBubble, opacity: 0.6 }}>
                <TypingDots />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={inputRowStyle}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any procedure..."
              style={inputStyle}
              disabled={loading}
              autoFocus
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                ...sendBtnStyle,
                opacity: loading || !input.trim() ? 0.4 : 1,
              }}
              aria-label="Send"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={toggleBtnStyle}
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? (
          <span style={{ fontSize: 18 }}>✕</span>
        ) : (
          <span style={{ fontSize: 20 }}>💬</span>
        )}
      </button>
    </>
  );
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#0b6b3a",
            display: "inline-block",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </span>
  );
}

// Styles
const windowStyle = {
  position: "fixed",
  bottom: 156,
  right: 16,
  width: "min(360px, calc(100vw - 32px))",
  maxHeight: "min(520px, calc(100vh - 200px))",
  background: "#f6f8f7",
  border: "1px solid rgba(2,55,27,0.18)",
  borderRadius: 20,
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
  zIndex: 1100,
  overflow: "hidden",
};

const headerStyle = {
  background: "#0b6b3a",
  padding: "12px 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
};

const closeBtnStyle = {
  background: "rgba(255,255,255,0.15)",
  border: "none",
  color: "#fff",
  width: 28,
  height: 28,
  borderRadius: "50%",
  cursor: "pointer",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
};

const messagesStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "12px 12px 4px",
  display: "flex",
  flexDirection: "column",
};

const welcomeStyle = {
  background: "#fff",
  borderRadius: 14,
  padding: 14,
  border: "1px solid rgba(2,55,27,0.10)",
  marginBottom: 8,
};

const suggestionStyle = {
  textAlign: "left",
  background: "rgba(11,107,58,0.07)",
  border: "1px solid rgba(11,107,58,0.15)",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 13,
  color: "#07522d",
  fontWeight: 700,
  cursor: "pointer",
  transition: "background 0.1s",
};

const userBubble = {
  background: "#0b6b3a",
  color: "#fff",
  borderRadius: "16px 16px 4px 16px",
  padding: "10px 14px",
  fontSize: 13,
  lineHeight: 1.5,
  maxWidth: "85%",
  marginLeft: "auto",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
};

const botBubble = {
  background: "#fff",
  color: "#0b1220",
  borderRadius: "4px 16px 16px 16px",
  padding: "10px 14px",
  fontSize: 13,
  lineHeight: 1.6,
  maxWidth: "92%",
  border: "1px solid rgba(2,55,27,0.10)",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
};

const sourcesStyle = {
  marginTop: 6,
  display: "flex",
  flexDirection: "column",
  gap: 4,
  maxWidth: "92%",
};

const sourceChipStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "#fff",
  border: "1px solid rgba(11,107,58,0.18)",
  borderRadius: 10,
  padding: "7px 10px",
  fontSize: 12,
  color: "#0b1220",
  fontWeight: 700,
  textDecoration: "none",
  cursor: "pointer",
};

const inputRowStyle = {
  padding: "10px 10px 10px",
  borderTop: "1px solid rgba(2,55,27,0.10)",
  display: "flex",
  gap: 8,
  flexShrink: 0,
  background: "#fff",
};

const inputStyle = {
  flex: 1,
  border: "1px solid rgba(2,55,27,0.20)",
  borderRadius: 12,
  padding: "10px 12px",
  fontSize: 13,
  color: "#0b1220",
  background: "#f6f8f7",
  outline: "none",
  fontFamily: "inherit",
};

const sendBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: "#0b6b3a",
  color: "#fff",
  border: "none",
  fontSize: 18,
  fontWeight: 900,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const toggleBtnStyle = {
  position: "fixed",
  bottom: 96,
  right: 16,
  width: 52,
  height: 52,
  borderRadius: "50%",
  background: "#0b6b3a",
  color: "#fff",
  border: "2px solid rgba(255,255,255,0.2)",
  boxShadow: "0 4px 20px rgba(11,107,58,0.5)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1100,
  transition: "transform 0.15s ease",
};
