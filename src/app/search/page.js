"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import offices from "@/data/offices.json";
import { searchOffices } from "@/lib/offices";
import { layout } from "@/lib/ui";

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

  const results = useMemo(() => {
    // base search (by text)
    const base = q.trim() ? searchOffices(q) : offices;

    return base.filter((o) => {
      const cityOk = city === "All" || o.city === city;
      const catOk = category === "All" || o.category === category;
      return cityOk && catOk;
    });
  }, [q, city, category]);

  return (
    <main style={page}>
      <div style={layout.container}>
      <div style={topRow}>
        <div>
          <h1 style={title}>Search</h1>
          <p style={sub}>Search + filter by city/category.</p>
        </div>
        <Link href="/" style={pill}>Home</Link>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder='Search e.g. "passport", "nadra", "clifton"...'
        style={input}
      />

      <div style={{ height: 10 }} />

      <div style={filtersRow}>
        <select value={city} onChange={(e) => setCity(e.target.value)} style={select}>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)} style={select}>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={() => { setQ(""); setCity("All"); setCategory("All"); }}
          style={clearBtn}
        >
          Clear
        </button>
      </div>

      <div style={{ height: 12 }} />

      <div style={{ display: "grid", gap: 12 }}>
        {results.length === 0 && (
          <div style={card}>
            <div style={{ fontWeight: 800 }}>No results</div>
            <div style={small}>Try a different search or clear filters.</div>
          </div>
        )}

        {results.map((o) => (
          <Link key={o.id} href={`/office/${o.id}`} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 800 }}>{o.name}</div>
              <span style={tag}>{o.category}</span>
            </div>
            <div style={small}>{o.city} • {o.area}</div>
          </Link>
        ))}
      </div>
      </div>
    </main>
  );
}

const page = {
  minHeight: "100vh",
  background: "#0b0f19",
  color: "#e7ecf5",
  padding: 18,
  paddingBottom: 90,
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

const title = { margin: 0, fontSize: 26 };
const sub = { margin: "6px 0 14px 0", color: "#a9b3c7" };
const small = { color: "#a9b3c7", fontSize: 13, marginTop: 4 };

const input = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "#e7ecf5",
  outline: "none",
  fontSize: 15,
};

const filtersRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: 10,
};

const select = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "#e7ecf5",
  outline: "none",
  fontSize: 14,
};

const clearBtn = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "#e7ecf5",
  fontWeight: 800,
  cursor: "pointer",
};

const card = {
  display: "block",
  padding: 14,
  borderRadius: 16,
  background: "#121a2a",
  border: "1px solid rgba(255,255,255,0.08)",
};

const tag = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 999,
  padding: "6px 10px",
  color: "#a9b3c7",
  fontSize: 12,
  height: "fit-content",
};

const pill = {
  height: "fit-content",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 999,
  padding: "8px 12px",
  color: "#a9b3c7",
  fontSize: 13,
};

