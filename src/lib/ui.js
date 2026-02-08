export const colors = {
    bg: "#0b0f19",
    card: "#121a2a",
    text: "#e7ecf5",
    muted: "#a9b3c7",
    border: "rgba(255,255,255,0.10)",
    borderSoft: "rgba(255,255,255,0.08)",
    accentBg: "rgba(93,214,255,0.14)",
    accentBorder: "rgba(93,214,255,0.20)",
  };
  
  export const layout = {
    page: {
      minHeight: "100vh",
      background: colors.bg,
      color: colors.text,
      padding: 18,
      paddingBottom: 90,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    },
    container: {
      maxWidth: 900,
      margin: "0 auto",
    },
    card: {
      background: colors.card,
      border: `1px solid ${colors.borderSoft}`,
      borderRadius: 16,
      padding: 14,
    },
    pill: {
      border: `1px solid ${colors.border}`,
      borderRadius: 999,
      padding: "8px 12px",
      color: colors.muted,
      fontSize: 13,
      height: "fit-content",
    },
    h1: { margin: 0, fontSize: 26, letterSpacing: 0.2 },
    sub: { margin: "6px 0 14px 0", color: colors.muted },
  };
  