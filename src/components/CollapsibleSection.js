"use client";

import { useState } from "react";
import { layout, colors } from "@/lib/ui";

export default function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section style={layout.card}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
        aria-expanded={open}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <div style={{ fontWeight: 900, fontSize: 16, color: colors.text }}>
            {title}
          </div>
        </div>

        <span
          style={{
            ...layout.pill,
            padding: "6px 10px",
            fontSize: 12,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </section>
  );
}