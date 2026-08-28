"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { layout } from "@/lib/ui";
import { distanceKm, formatDistance } from "@/lib/geo";
import { slugify } from "@/lib/slug";
import { CITIES, OFFICE_CATEGORIES } from "@/lib/constants";
import OpenNowBadge from "@/components/OpenNowBadge";

const PAGE_SIZE = 20;

const theme = {
  ink: "#0b1220",
  muted: "#334155",
  border: "rgba(2, 55, 27, 0.16)",
  borderSoft: "rgba(2, 55, 27, 0.10)",
  softBg: "rgba(11, 107, 58, 0.08)",
  activeBg: "rgba(11, 107, 58, 0.16)",
  activeBorder: "rgba(11, 107, 58, 0.35)",
  highlightBg: "rgba(11, 107, 58, 0.18)",
  highlightBorder: "rgba(11, 107, 58, 0.28)",
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
  return (
    <>
      {safeText.slice(0, idx)}
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
        {safeText.slice(idx, idx + q.length)}
      </span>
      {safeText.slice(idx + q.length)}
    </>
  );
}

function ResultCard({ office, query = "", distKm }) {
  const distLabel = distKm != null && isFinite(distKm) ? formatDistance(distKm) : null;

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
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 900, color: theme.ink }}>
          {highlight(office.name, query)}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <OpenNowBadge hours={office.hours} />
          <span
            style={{
              padding: "5px 9px",
              borderRadius: 999,
              border: `1px solid ${theme.border}`,
              background: theme.softBg,
              color: theme.ink,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {office.category}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
        <span
          style={{
            padding: "5px 9px",
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
              padding: "5px 9px",
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
        {distLabel && (
          <span
            style={{
              padding: "5px 9px",
              borderRadius: 999,
              border: "1px solid rgba(11,107,58,0.25)",
              background: "rgba(11,107,58,0.08)",
              color: "#0b6b3a",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            📍 {distLabel}
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

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiData, setAiData] = useState(null);

  // Geolocation state
  const [location, setLocation] = useState(null); // { lat, lng } | null
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");

  const cities = useMemo(() => ["All", ...CITIES], []);
  const categories = useMemo(() => ["All", ...OFFICE_CATEGORIES], []);

  async function runSearch(page) {
    const myRequestId = ++requestId.current;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);
    setError("");

    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (q.trim()) params.set("q", q.trim());
      if (city !== "All") params.set("city", slugify(city));
      if (category !== "All") params.set("category", slugify(category));

      const res = await fetch(`/api/search?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Search failed");
      if (myRequestId !== requestId.current) return; // a newer search superseded this one

      setResults((prev) => (page === 1 ? json.results : [...prev, ...json.results]));
      setPagination(json.pagination);
    } catch (err) {
      if (myRequestId === requestId.current) setError(err.message || "Something went wrong");
    } finally {
      if (myRequestId === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }

  // Debounced search whenever filters change.
  useEffect(() => {
    const t = setTimeout(() => runSearch(1), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, city, category]);

  const sortedResults = useMemo(() => {
    if (!location) return results;
    return [...results].sort(
      (a, b) => distanceKm(a, location.lat, location.lng) - distanceKm(b, location.lat, location.lng)
    );
  }, [results, location]);

  const clearAll = () => {
    setQ("");
    setCity("All");
    setCategory("All");
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLocLoading(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      (err) => {
        setLocError(
          err.code === 1
            ? "Location permission denied. Enable it in your browser settings."
            : "Could not get your location."
        );
        setLocLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setLocError("");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "AI search failed");
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
          <div style={{ fontWeight: 900, color: theme.ink, marginBottom: 6 }}>AI Search</div>
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
                  Clear
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
                  <span style={layout.badge}>City: {aiData.filters?.city || "—"}</span>
                  <span style={layout.badge}>Category: {aiData.filters?.category || "—"}</span>
                  <span style={layout.badge}>Area: {aiData.filters?.area || "—"}</span>
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
                <b style={{ color: theme.ink }}>
                  {aiData.pagination?.total ?? aiData.results?.length ?? 0}
                </b>{" "}
                result(s).
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

        {/* Manual search input */}
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
          <div style={{ color: theme.muted, fontSize: 12, marginBottom: 6 }}>Quick filters</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cities
              .filter((c) => c !== "All")
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

        {/* Near me bar */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {!location ? (
            <button
              onClick={requestLocation}
              disabled={locLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 999,
                padding: "9px 14px",
                border: `1px solid ${theme.border}`,
                background: theme.softBg,
                color: theme.ink,
                cursor: locLoading ? "default" : "pointer",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {locLoading ? "Getting location…" : "📍 Sort by distance"}
            </button>
          ) : (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                padding: "9px 14px",
                border: `1px solid rgba(11,107,58,0.30)`,
                background: "rgba(11,107,58,0.10)",
                color: "#0b6b3a",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              📍 Sorted by distance
              <button
                onClick={clearLocation}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#0b6b3a",
                  fontWeight: 900,
                  fontSize: 14,
                  padding: "0 2px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          )}
          {locError && (
            <div style={{ color: theme.danger, fontSize: 13 }}>{locError}</div>
          )}
        </div>

        {/* Summary */}
        <div style={{ marginTop: 10, color: theme.muted, fontSize: 13 }}>
          {loading ? (
            "Searching…"
          ) : (
            <>
              Showing <b style={{ color: theme.ink }}>{results.length}</b> of{" "}
              <b style={{ color: theme.ink }}>{pagination.total}</b> result(s).
            </>
          )}
        </div>

        <div style={{ height: 12 }} />

        {error && (
          <div style={{ ...layout.card, color: theme.danger, marginBottom: 12 }}>{error}</div>
        )}

        {/* Results */}
        <div style={{ display: "grid", gap: 16 }}>
          {!loading && sortedResults.length === 0 ? (
            <div style={layout.card}>
              <div style={{ fontWeight: 900, marginBottom: 6, color: theme.ink }}>
                No results found
              </div>
              <div style={{ color: theme.muted, lineHeight: 1.6 }}>
                Try a different keyword, or set City/Category back to <b>All</b>.
                {q && (
                  <div style={{ marginTop: 8 }}>
                    If you&apos;re looking for a city we haven&apos;t added yet, use the{" "}
                    <b>Suggest correction</b> button on any office page to let us know.
                  </div>
                )}
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
            sortedResults.map((o) => (
              <ResultCard
                key={o.id}
                office={o}
                query={q}
                distKm={location ? distanceKm(o, location.lat, location.lng) : null}
              />
            ))
          )}
        </div>

        {!loading && pagination.page < pagination.totalPages && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <button
              onClick={() => runSearch(pagination.page + 1)}
              disabled={loadingMore}
              style={{
                borderRadius: 999,
                padding: "10px 18px",
                border: `1px solid ${theme.border}`,
                background: theme.softBg,
                color: theme.ink,
                cursor: loadingMore ? "default" : "pointer",
                fontWeight: 800,
              }}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
