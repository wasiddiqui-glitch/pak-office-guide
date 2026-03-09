"use client";

export default function CopyButton({ text, label = "Copy", style = {} }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch (e) {
      alert("Failed to copy");
    }
  };

  return (
    <button
      onClick={copy}
      style={{
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 999,
        padding: "8px 12px",
        background: "rgba(255,255,255,0.04)",
        color: "black",
        cursor: "pointer",
        fontSize: 13,

        ...style, // ✅ allows page to override style (bubble style)
      }}
    >
      📋 {label}
    </button>
  );
}
