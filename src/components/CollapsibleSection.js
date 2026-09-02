"use client";

import { useState } from "react";
import { layout, colors, type, space } from "@/lib/ui";

export default function CollapsibleSection({ title, defaultOpen = false, children }) {
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
        <div style={{ ...type.h3, color: colors.text }}>{title}</div>

        <span
          className="ui-icon-btn"
          style={{
            width: 26,
            height: 26,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: `1px solid ${colors.border}`,
            fontSize: 16,
            lineHeight: 1,
            userSelect: "none",
            color: colors.greenDark,
            flexShrink: 0,
          }}
        >
          {open ? "−" : "+"}
        </span>
      </button>

      {open && <div style={{ marginTop: space.md }}>{children}</div>}
    </section>
  );
}