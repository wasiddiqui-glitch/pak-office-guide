// src/lib/ui.js

export const colors = {
  // NADRA-ish light theme
  bg: "#f6f8f7",          // off-white page background
  card: "#ffffff",        // white cards
  text: "#0b1220",        // near-black text (readable)
  muted: "#334155",       // darker muted (readable on white)

  // green accents
  green: "#0b6b3a",
  greenDark: "#07522d",
  greenSoft: "rgba(11,107,58,0.10)",

  // borders / surfaces
  border: "rgba(2, 55, 27, 0.16)",
  borderSoft: "rgba(2, 55, 27, 0.10)",

  // accent for buttons/active states
  accentBg: "rgba(11,107,58,0.14)",
  accentBorder: "rgba(11,107,58,0.22)",
};

export const layout = {
  page: {
    minHeight: "100vh",
    background: colors.bg,
    color: colors.text,
    padding: 18,
    paddingBottom: 90,
    fontFamily: "var(--font-inter), system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },

  container: {
    maxWidth: 900,
    margin: "0 auto",
  },

  // general card used across pages
  card: {
    background: colors.card,
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    color: colors.text,
  },

  // slightly more "premium" surface (optional)
  surface: {
    background: colors.card,
    border: `1px solid ${colors.borderSoft}`,
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },

  // city list cards (green-tinted)
  cityCard: {
    background: "rgba(11,107,58,0.10)",      // light green tint
    border: `1px solid ${colors.accentBorder}`,
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    color: colors.text,
  },

  pill: {
    border: `1px solid ${colors.border}`,
    borderRadius: 999,
    padding: "8px 12px",
    color: colors.greenDark,
    background: colors.greenSoft,
    fontSize: 13,
    height: "fit-content",
    fontWeight: 800,
    textDecoration: "none",
  },

  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    color: colors.greenDark,
    fontSize: 12,
    background: "rgba(11,107,58,0.08)",
    fontWeight: 800,
  },

  buttonPrimary: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.06)",
    background: colors.green,
    color: "white",
    fontWeight: 700,
    fontSize: 14,
    textDecoration: "none",
    cursor: "pointer",
  },

  buttonSoft: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: "14px 16px",
    borderRadius: 14,
    border: `1px solid ${colors.border}`,
    background: colors.greenSoft,
    color: colors.greenDark,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: "none",
    cursor: "pointer",
  },

  h1: { margin: 0, fontSize: 28, letterSpacing: -0.3, fontWeight: 800, lineHeight: 1.15 },
  sub: { margin: "6px 0 16px 0", color: colors.muted, lineHeight: 1.5 },
};

// Consistent type scale — every page should pull headings/body text from here
// instead of inventing one-off font sizes, so the app reads as one product.
export const type = {
  display: { margin: 0, fontSize: 30, letterSpacing: -0.4, fontWeight: 800, lineHeight: 1.1 },
  h1: { margin: 0, fontSize: 24, letterSpacing: -0.3, fontWeight: 800, lineHeight: 1.2 },
  h2: { margin: 0, fontSize: 17, letterSpacing: -0.1, fontWeight: 700, lineHeight: 1.3 },
  h3: { margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.4 },
  body: { margin: 0, fontSize: 14, lineHeight: 1.65, color: colors.muted },
  small: { margin: 0, fontSize: 13, lineHeight: 1.55, color: colors.muted },
  // Small uppercase tracked labels used as section "eyebrows" above headings.
  eyebrow: {
    margin: 0,
    fontSize: 11.5,
    fontWeight: 800,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.green,
  },
};

// 4px-based spacing scale — pick from here rather than arbitrary numbers.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

// Responsive grid helper: replaces hardcoded `1fr 1fr` columns that don't
// adapt to viewport width.
export const grid = (min = 220, gap = space.md) => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
  gap,
});

  
  