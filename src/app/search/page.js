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
  danger: "#b91c1c",
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
  const safeText = String(text || "");
  const q = query.trim();
  if (!q) return safeText;

  const idx = safeText.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return safeText;

  const before = safeText.slice(0, idx);
  const match = safeText.slice(idx, idx + q.length);
  const after = safeText.slice(idx + q.length);

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

function ResultCard({ office, query = "" }) {
  return (
    <Link
      href={`/office/${office.id}`}
      style={{
        ...layout.card,
        background: theme.white,
        border: `1px solid ${theme.borderSoft}`,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontWeight: 900, color: theme.ink }}>
          {highlight(office.name, query)}
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
          {office.category}
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
          {office.city}
        </span>

        {office.area && (
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
            {office.area}
          </span>
        )}
      </div>

      {office.address && (
        <div style={{ marginTop: 8, color: theme.muted, fontSize: 13, lineHeight: 1.5 }}>
          {highlight(office.address, query)}
        </div>
      )}
    </Link>
  );
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("All");
  const [category, setCategory] = useState("All");

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiData, setAiData] = useState(null);

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

  const runAiSearch = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiError("");
    setAiData(null);

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: aiQuery }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "AI search failed");
      }

      setAiData(json);
    } catch (err) {
      setAiError(err.message || "Something went wrong");
    } finally {
      setAiLoading(false);
    }
  };

  const clearAi = () => {
    setAiQuery("");
    setAiError("");
    setAiData(null);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setQ("");
      }
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
              Find offices manually, or use AI to search in plain English.
            </p>
          </div>
          <Link
            href="/"
            style={{ ...layout.pill, color: theme.ink, border: `1px solid ${theme.border}` }}
          >
            Home
          </Link>
        </div>

        {/* AI Search */}
        <div
          style={{
            ...layout.card,
            background: theme.white,
            border: `1px solid ${theme.borderSoft}`,
            marginBottom: 14,
          }}
        >
          <div style={{ fontWeight: 900, color: theme.ink, marginBottom: 6 }}>
            AI Search
          </div>
          <div style={{ color: theme.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
            Try queries like <b>passport office in islamabad</b>,{" "}
            <b>nadra near dha lahore</b>, or <b>electricity bill office rawalpindi</b>.
          </div>

          <form onSubmit={runAiSearch} style={{ display: "grid", gap: 10 }}>
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder='Ask naturally e.g. "passport office in islamabad near blue area"'
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

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                style={{
                  borderRadius: 999,
                  padding: "10px 14px",
                  border: `1px solid ${theme.activeBorder}`,
                  background: theme.activeBg,
                  color: theme.ink,
                  cursor: aiLoading ? "default" : "pointer",
                  fontWeight: 900,
                }}
              >
                {aiLoading ? "Searching..." : "Run AI Search"}
              </button>

              {(aiData || aiError || aiQuery) && (
                <button
                  type="button"
                  onClick={clearAi}
                  style={{
                    borderRadius: 999,
                    padding: "10px 14px",
                    border: `1px solid ${theme.border}`,
                    background: theme.softBg,
                    color: theme.ink,
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Clear AI Search
                </button>
              )}
            </div>
          </form>

          {aiError && (
            <div style={{ marginTop: 12, color: theme.danger, fontSize: 14 }}>{aiError}</div>
          )}

          {aiData && (
            <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
              <div
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  background: theme.softBg,
                }}
              >
                <div style={{ fontWeight: 900, color: theme.ink, marginBottom: 8 }}>
                  AI detected
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={layout.badge}>
                    City: {aiData.filters?.city || "—"}
                  </span>
                  <span style={layout.badge}>
                    Category: {aiData.filters?.category || "—"}
                  </span>
                  <span style={layout.badge}>
                    Area: {aiData.filters?.area || "—"}
                  </span>
                  <span style={layout.badge}>
                    Keywords:{" "}
                    {(aiData.filters?.keywords || []).length > 0
                      ? aiData.filters.keywords.join(", ")
                      : "—"}
                  </span>
                </div>
              </div>

              <div style={{ color: theme.muted, fontSize: 13 }}>
                AI found{" "}
                <b style={{ color: theme.ink }}>{aiData.results?.length || 0}</b> result(s).
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {aiData.results?.length > 0 ? (
                  aiData.results.map((office) => (
                    <ResultCard key={office.id} office={office} query={aiQuery} />
                  ))
                ) : (
                  <div style={layout.card}>
                    <div style={{ fontWeight: 900, marginBottom: 6, color: theme.ink }}>
                      No AI matches found
                    </div>
                    <div style={{ color: theme.muted, lineHeight: 1.6 }}>
                      Try a more direct query like <b>passport office in islamabad</b> or{" "}
                      <b>nadra lahore</b>.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Manual Search input */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Manual search e.g. "nadra", "clifton", "gulberg"... (Esc clears)'
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
          Showing <b style={{ color: theme.ink }}>{filtered.length}</b> manual result(s) out of{" "}
          <b style={{ color: theme.ink }}>{offices.length}</b>.
        </div>

        <div style={{ height: 12 }} />

        {/* Manual results */}
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
            filtered.map((o) => <ResultCard key={o.id} office={o} query={q} />)
          )}
        </div>
      </div>
    </main>
  );
}
