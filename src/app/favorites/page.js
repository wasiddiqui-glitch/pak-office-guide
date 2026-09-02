"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { layout, type, space } from "@/lib/ui";
import { getFavorites } from "@/lib/favorites";
import PageHeader from "@/components/PageHeader";
import OfficeListItem from "@/components/OfficeListItem";

export default function FavoritesPage() {
  const [ids, setIds] = useState([]);
  const [favOffices, setFavOffices] = useState([]);

  useEffect(() => {
    // Reading localStorage must happen after mount (SSR has no `window`) —
    // setting state here, once, on mount is the standard hydration-safe pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIds(getFavorites());

    // update if user opens another tab / saves elsewhere
    const onStorage = () => setIds(getFavorites());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (ids.length === 0) return;
    let cancelled = false;
    fetch(`/api/offices?ids=${encodeURIComponent(ids.join(","))}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setFavOffices(json.offices || []);
      })
      .catch(() => {
        if (!cancelled) setFavOffices([]);
      });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const displayedOffices = ids.length === 0 ? [] : favOffices;

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <PageHeader
          eyebrow="On this device"
          title="Favorites"
          sub="Offices you've saved for quick access."
          action={{ href: "/", label: "Home" }}
        />

        {displayedOffices.length === 0 ? (
          <div style={layout.card}>
            <div style={type.h3}>No favorites yet</div>
            <div style={{ ...type.body, marginTop: space.xs }}>
              Open any office and tap <b style={{ color: "inherit" }}>Save</b>.
            </div>
            <div style={{ height: space.sm }} />
            <Link href="/search" className="ui-badge" style={layout.pill}>
              Go to Search
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: space.md }}>
            {displayedOffices.map((o) => (
              <OfficeListItem key={o.id} office={o} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
