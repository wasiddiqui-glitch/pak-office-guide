import Link from "next/link";
import { getOfficesByCity } from "@/lib/offices";
import { layout } from "@/lib/ui";
import OpenNowBadge from "@/components/OpenNowBadge";

export async function generateMetadata({ params }) {
  const { city: rawCity } = await params;
  const city = decodeURIComponent(rawCity);
  return {
    title: `Government Offices in ${city}`,
    description: `Browse NADRA, Passport, Driving License, and other government offices in ${city}, Pakistan.`,
    openGraph: {
      title: `Government Offices in ${city}`,
      description: `Find requirements and steps for government offices in ${city}.`,
    },
  };
}

export default async function CityPage({ params }) {
  const { city: rawCity } = await params; // params is a Promise in your Next version
  const city = decodeURIComponent(rawCity);

  const offices = await getOfficesByCity(city);

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        {/* Breadcrumbs + header */}
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/" style={{ ...layout.badge, textDecoration: "none" }}>
              Home
            </Link>
            <span style={layout.badge}>›</span>
            <Link href="/cities" style={{ ...layout.badge, textDecoration: "none" }}>
              Cities
            </Link>
            <span style={layout.badge}>›</span>
            <span style={layout.badge}>{city}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div>
              <h1 style={layout.h1}>{city}</h1>
              <p style={layout.sub}>{offices.length} office(s)</p>
            </div>

            <Link href="/cities" style={{ ...layout.pill, textDecoration: "none" }}>
              All cities
            </Link>
          </div>
        </div>

        {/* Offices list */}
        <div style={{ display: "grid", gap: 12 }}>
          {offices.map((o) => (
            <Link
              key={o.id}
              href={`/office/${o.id}`}
              style={{ ...layout.card, display: "block", textDecoration: "none" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>{o.name}</div>
                <OpenNowBadge hours={o.hours} />
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                <span style={layout.badge}>{o.category}</span>
                <span style={layout.badge}>{o.area}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}





