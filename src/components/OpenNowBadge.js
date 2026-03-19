"use client";

import { useMemo } from "react";
import { isOpenNow } from "@/lib/hours";

export default function OpenNowBadge({ hours, style = {} }) {
  const status = useMemo(() => isOpenNow(hours), [hours]);
  if (!status) return null;

  const open = status === "open";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        background: open ? "rgba(11,107,58,0.10)" : "rgba(185,28,28,0.09)",
        border: `1px solid ${open ? "rgba(11,107,58,0.22)" : "rgba(185,28,28,0.18)"}`,
        color: open ? "#0b6b3a" : "#b91c1c",
        ...style,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: open ? "#0b6b3a" : "#b91c1c",
          flexShrink: 0,
        }}
      />
      {open ? "Open now" : "Closed"}
    </span>
  );
}
