"use client";

import { useState } from "react";
import Link from "next/link";
import { layout, colors } from "@/lib/ui";

export default function AISearchBox() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setData(null);

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Search failed");
      }

      setData(json);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="text"
          placeholder="Try: passport office in islamabad, nadra near dha lahore..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.12)",
            fontSize: 16,
            outline: "none",
            background: "white",
          }}
        />

        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            ...layout.pill,
            cursor: loading ? "default" : "pointer",
            borderRadius: 14,
            padding: "12px 16px",
            fontWeight: 700,
          }}
        >
          {loading ? "Searching..." : "AI Search"}
        </button>
      </form>

      {error && (
        <div style={{ color: "#b91c1c", fontSize: 14 }}>
          {error}
        </div>
      )}

      {data && (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ ...layout.card }}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Detected filters</h3>
            <div style={{ color: colors.muted, lineHeight: 1.7 }}>
              <div><b style={{ color: colors.text }}>City:</b> {data.filters.city || "—"}</div>
              <div><b style={{ color: colors.text }}>Category:</b> {data.filters.category || "—"}</div>
              <div><b style={{ color: colors.text }}>Area:</b> {data.filters.area || "—"}</div>
              <div>
                <b style={{ color: colors.text }}>Keywords:</b>{" "}
                {(data.filters.keywords || []).length > 0
                  ? data.filters.keywords.join(", ")
                  : "—"}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {data.results.length === 0 ? (
              <div style={layout.card}>No matching offices found.</div>
            ) : (
              data.results.map((office) => (
                <Link
                  key={office.id}
                  href={`/office/${office.id}`}
                  style={{
                    ...layout.card,
                    textDecoration: "none",
                    color: "inherit",
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{office.name}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={layout.badge}>{office.category}</span>
                    <span style={layout.badge}>{office.city}</span>
                    {office.area ? <span style={layout.badge}>{office.area}</span> : null}
                  </div>
                  <div style={{ color: colors.muted }}>
                    {office.address || "Address not added yet"}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}