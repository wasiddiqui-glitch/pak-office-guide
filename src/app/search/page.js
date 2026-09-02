"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { layout, colors, type, space } from "@/lib/ui";
import { distanceKm, formatDistance } from "@/lib/geo";
import { slugify } from "@/lib/slug";
import { CITIES, OFFICE_CATEGORIES } from "@/lib/constants";
import OpenNowBadge from "@/components/OpenNowBadge";
import PageHeader from "@/components/PageHeader";

const PAGE_SIZE = 20;

function Chip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ui-btn"
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: active ? `1px solid ${colors.accentBorder}` : `1px solid ${colors.border}`,
        background: active ? colors.accentBg : colors.greenSoft,
        color: colors.text,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: active ? 800 : 600,
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
          background: "rgba(11,107,58,0.18)",
          border: "1px solid rgba(11,107,58,0.28)",
          color: colors.text,
          fontWeight: 800,
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
      className="ui-tile"
      style={{ ...layout.card, textDecoration: "none", color: "inherit" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: space.sm, flexWrap: "wrap" }}>
        <div style={type.h3}>{highlight(office.name, query)}</div>
        <div style={{ display: "flex", gap: space.xs, alignItems: "center", flexWrap: "wrap" }}>
          <OpenNowBadge hours={office.hours} />
          <span style={layout.badge}>{office.category}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: space.xs, flexWrap: "wrap", marginTop: space.sm }}>
        <span style={layout.badge}>{office.city}</span>
        {office.area && <span style={layout.badge}>{office.area}</span>}
        {distLabel && (
          <span style={{ ...layout.badge, color: colors.green }}>{distLabel}</span>
        )}
      </div>

      {office.address && (
        <div style={{ ...type.small, marginTop: space.sm }}>{highlight(office.address, query)}</div>
      )}
    </Link>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: `1px solid ${colors.border}`,
  background: colors.card,
  color: colors.text,
  outline: "none",
  fontSize: 15,
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

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
        <PageHeader
          eyebrow="Find an office"
          title="Search"
          sub="Find offices manually, or use AI to search in plain English."
          action={{ href: "/", label: "Home" }}
        />

        {/* AI Search */}
        <div style={{ ...layout.card, marginBottom: space.md }}>
          <div style={{ ...type.h2, marginBottom: space.xs }}>AI Search</div>
          <div style={{ ...type.body, marginBottom: space.md }}>
            Try queries like <b style={{ color: colors.text }}>passport office in islamabad</b>,{" "}
            <b style={{ color: colors.text }}>nadra near dha lahore</b>, or{" "}
            <b style={{ color: colors.text }}>electricity bill office rawalpindi</b>.
          </div>

          <form onSubmit={runAiSearch} style={{ display: "grid", gap: space.sm }}>
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder='Ask naturally e.g. "passport office in islamabad near blue area"'
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: space.sm, flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                className="ui-btn"
                style={{ ...layout.buttonPrimary, borderRadius: 999, padding: "10px 16px" }}
              >
                {aiLoading ? "Searching…" : "Run AI Search"}
              </button>
              {(aiData || aiError || aiQuery) && (
                <button
                  type="button"
                  onClick={clearAi}
                  className="ui-btn"
                  style={{ ...layout.buttonSoft, borderRadius: 999, padding: "10px 16px" }}
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {aiError && <div style={{ marginTop: space.md, color: "#b91c1c", fontSize: 14 }}>{aiError}</div>}

          {aiData && (
            <div style={{ marginTop: space.lg, display: "grid", gap: space.md }}>
              <div style={{ padding: space.md, borderRadius: 14, border: `1px solid ${colors.border}`, background: colors.greenSoft }}>
                <div style={{ ...type.h3, color: colors.text, marginBottom: space.sm }}>AI detected</div>
                <div style={{ display: "flex", gap: space.xs, flexWrap: "wrap" }}>
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
              <div style={type.small}>
                AI found{" "}
                <b style={{ color: colors.text }}>{aiData.pagination?.total ?? aiData.results?.length ?? 0}</b>{" "}
                result(s).
              </div>
              <div style={{ display: "grid", gap: space.md }}>
                {aiData.results?.length > 0 ? (
                  aiData.results.map((office) => (
                    <ResultCard key={office.id} office={office} query={aiQuery} />
                  ))
                ) : (
                  <div style={layout.card}>
                    <div style={{ ...type.h3, marginBottom: space.xs, color: colors.text }}>
                      No AI matches found
                    </div>
                    <div style={type.body}>
                      Try a more direct query like{" "}
                      <b style={{ color: colors.text }}>passport office in islamabad</b> or{" "}
                      <b style={{ color: colors.text }}>nadra lahore</b>.
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
          style={inputStyle}
        />

        {/* Quick filter chips */}
        <div style={{ marginTop: space.md }}>
          <p style={type.eyebrow}>Quick filters</p>
          <div style={{ display: "flex", gap: space.xs, flexWrap: "wrap", marginTop: space.sm }}>
            {cities
              .filter((c) => c !== "All")
              .map((c) => (
                <Chip key={c} label={c} active={city === c} onClick={() => setCity(city === c ? "All" : c)} />
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
        <div style={{ marginTop: space.md, display: "flex", alignItems: "center", gap: space.sm, flexWrap: "wrap" }}>
          {!location ? (
            <button
              onClick={requestLocation}
              disabled={locLoading}
              className="ui-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 999,
                padding: "9px 14px",
                border: `1px solid ${colors.border}`,
                background: colors.greenSoft,
                color: colors.text,
                cursor: locLoading ? "default" : "pointer",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {locLoading ? "Getting location…" : "Sort by distance"}
            </button>
          ) : (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: space.xs,
                borderRadius: 999,
                padding: "9px 14px",
                border: "1px solid rgba(11,107,58,0.30)",
                background: "rgba(11,107,58,0.10)",
                color: colors.green,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Sorted by distance
              <button
                onClick={clearLocation}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: colors.green,
                  fontWeight: 800,
                  fontSize: 14,
                  padding: "0 2px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          )}
          {locError && <div style={{ color: "#b91c1c", fontSize: 13 }}>{locError}</div>}
        </div>

        {/* Summary */}
        <div style={{ marginTop: space.md, ...type.small }}>
          {loading ? (
            "Searching…"
          ) : (
            <>
              Showing <b style={{ color: colors.text }}>{results.length}</b> of{" "}
              <b style={{ color: colors.text }}>{pagination.total}</b> result(s).
            </>
          )}
        </div>

        <div style={{ height: space.md }} />

        {error && (
          <div style={{ ...layout.card, color: "#b91c1c", marginBottom: space.md }}>{error}</div>
        )}

        {/* Results */}
        <div style={{ display: "grid", gap: space.md }}>
          {!loading && sortedResults.length === 0 ? (
            <div style={layout.card}>
              <div style={{ ...type.h3, marginBottom: space.xs, color: colors.text }}>No results found</div>
              <div style={type.body}>
                Try a different keyword, or set City/Category back to <b style={{ color: colors.text }}>All</b>.
                {q && (
                  <div style={{ marginTop: space.sm }}>
                    If you&apos;re looking for a city we haven&apos;t added yet, use the{" "}
                    <b style={{ color: colors.text }}>Suggest correction</b> button on any office page to let
                    us know.
                  </div>
                )}
              </div>
              <div style={{ height: space.sm }} />
              <button
                onClick={clearAll}
                className="ui-btn"
                style={{ ...layout.buttonPrimary, borderRadius: 999, padding: "10px 16px" }}
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
          <div style={{ display: "flex", justifyContent: "center", marginTop: space.lg }}>
            <button
              onClick={() => runSearch(pagination.page + 1)}
              disabled={loadingMore}
              className="ui-btn"
              style={{ ...layout.buttonSoft, borderRadius: 999, padding: "10px 18px" }}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
