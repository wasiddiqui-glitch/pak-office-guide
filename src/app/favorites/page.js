"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import offices from "@/data/offices.json";
import { layout, colors } from "@/lib/ui";
import { getFavorites } from "@/lib/favorites";

export default function FavoritesPage() {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    setIds(getFavorites());

    // update if user opens another tab / saves elsewhere
    const onStorage = () => setIds(getFavorites());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const favOffices = offices.filter((o) => ids.includes(o.id));

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={layout.h1}>Favorites</h1>
            <p style={layout.sub}>Saved offices on this device.</p>
          </div>
          <Link href="/" style={layout.pill}>
            Home
          </Link>
        </div>

        {favOffices.length === 0 ? (
          <div style={layout.card}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>No favorites yet</div>
            <div style={{ color: colors.muted, lineHeight: 1.6 }}>
              Open any office and tap <b>Save</b>.
            </div>
            <div style={{ height: 10 }} />
            <Link href="/search" style={layout.pill}>
              Go to Search
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {favOffices.map((o) => (
              <Link
                key={o.id}
                href={`/office/${o.id}`}
                style={{ ...layout.card, textDecoration: "none" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 900, color: colors.text }}>{o.name}</div>
                  <span style={layout.badge}>{o.category}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  <span style={layout.badge}>{o.city}</span>
                  <span style={layout.badge}>{o.area}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}