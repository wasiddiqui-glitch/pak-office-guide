"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Copy", style = {}, className }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={copy}
      className={className}
      style={{
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 999,
        padding: "8px 12px",
        background: copied ? "rgba(11,107,58,0.15)" : "rgba(255,255,255,0.04)",
        color: "black",
        cursor: "pointer",
        fontSize: 13,
        transition: "background 0.2s",
        ...style,
      }}
    >
      {copied ? "✓ Copied!" : `${label}`}
    </button>
  );
}
