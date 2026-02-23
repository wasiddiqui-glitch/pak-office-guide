

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import offices from "@/data/offices.json";
import { layout } from "@/lib/ui";

// --- GREEN THEME (local to this page) ---
const theme = {
  ink: "#0b1a12",
  muted: "#355a45",
  border: "rgba(0, 80, 40, 0.20)",
  borderSoft: "rgba(0, 80, 40, 0.14)",
  softBg: "rgba(0, 120, 60, 0.08)",
  activeBg: "rgba(0, 120, 60, 0.16)",
  activeBorder: "rgba(0, 120, 60, 0.35)",
  highlightBg: "rgba(0, 120, 60, 0.18)",
  highlightBorder: "rgba(0, 120, 60, 0.28)",
  white: "#ffffff",
};

function Chip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: active ? `1px solid ${theme.activeBorder}` : `1px solid ${theme.border}`,
        background: active ? theme.activeBg : theme.softBg,
        color: theme.ink,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: active ? 900 : 700,
      }}
    >
      {label}
    </button>
  );
}

function highlight(text, query) {
  const q = query.trim();
  if (!q) return text;

  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);

  return (
    <>
      {before}
      <span
        style={{
          padding: "0 4px",
          borderRadius: 8,
          background: theme.highlightBg,
          border: `1px solid ${theme.highlightBorder}`,
          color: theme.ink,
          fontWeight: 900,
        }}
      >
        {match}
      </span>
      {after}
    </>
  );
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("All");
  const [category, setCategory] = useState("All");

  const cities = useMemo(
    () => ["All", ...Array.from(new Set(offices.map((o) => o.city))).sort()],
    []
  );

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(offices.map((o) => o.category))).sort()],
    []
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const base = query
      ? offices.filter((o) => {
          const hay = [o.name, o.city, o.area, o.category, o.address]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(query);
        })
      : offices;

    return base.filter((o) => {
      const cityOk = city === "All" || o.city === city;
      const catOk = category === "All" || o.category === category;
      return cityOk && catOk;
    });
  }, [q, city, category]);

  const clearAll = () => {
    setQ("");
    setCity("All");
    setCategory("All");
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setQ("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ ...layout.h1, color: theme.ink }}>Search</h1>
            <p style={{ ...layout.sub, color: theme.muted }}>
              Find offices by name, area, city, or category.
            </p>
          </div>
          <Link href="/" style={{ ...layout.pill, color: theme.ink, border: `1px solid ${theme.border}` }}>
            Home
          </Link>
        </div>

        {/* Search input */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search e.g. "nadra", "clifton", "gulberg"... (Esc clears)'
          style={{
            width: "100%",
            padding: "12px 12px",
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.white,
            color: theme.ink,
            outline: "none",
            fontSize: 15,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
          }}
        />

        <div style={{ height: 10 }} />

        {/* Quick filter chips */}
        <div style={{ marginTop: 10 }}>
          <div style={{ color: theme.muted, fontSize: 12, marginBottom: 6 }}>
            Quick filters
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cities
              .filter((c) => c !== "All")
              .slice(0, 6)
              .map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={city === c}
                  onClick={() => setCity(city === c ? "All" : c)}
                />
              ))}

            {categories
              .filter((c) => c !== "All")
              .slice(0, 6)
              .map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={category === c}
                  onClick={() => setCategory(category === c ? "All" : c)}
                />
              ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ marginTop: 12, color: theme.muted, fontSize: 13 }}>
          Showing <b style={{ color: theme.ink }}>{filtered.length}</b> result(s) out of{" "}
          <b style={{ color: theme.ink }}>{offices.length}</b>.
        </div>

        <div style={{ height: 12 }} />

        {/* Results */}
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={layout.card}>
              <div style={{ fontWeight: 900, marginBottom: 6, color: theme.ink }}>
                No results found
              </div>
              <div style={{ color: theme.muted, lineHeight: 1.6 }}>
                Try a different keyword, or set City/Category back to <b>All</b>.
              </div>
              <div style={{ height: 10 }} />
              <button
                onClick={clearAll}
                style={{
                  borderRadius: 999,
                  padding: "10px 14px",
                  border: `1px solid ${theme.activeBorder}`,
                  background: theme.activeBg,
                  color: theme.ink,
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            filtered.map((o) => (
              <Link
                key={o.id}
                href={`/office/${o.id}`}
                style={{
                  ...layout.card,
                  background: theme.white,
                  border: `1px solid ${theme.borderSoft}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 900, color: theme.ink }}>
                    {highlight(o.name, q)}
                  </div>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: `1px solid ${theme.border}`,
                      background: theme.softBg,
                      color: theme.ink,
                      fontSize: 12,
                      fontWeight: 800,
                      height: "fit-content",
                    }}
                  >
                    {o.category}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: `1px solid ${theme.border}`,
                      background: theme.softBg,
                      color: theme.ink,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {o.city}
                  </span>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: `1px solid ${theme.border}`,
                      background: theme.softBg,
                      color: theme.ink,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {o.area}
                  </span>
                </div>

                {o.address && (
                  <div style={{ marginTop: 8, color: theme.muted, fontSize: 13, lineHeight: 1.5 }}>
                    {highlight(o.address, q)}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
