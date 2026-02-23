import Link from "next/link";
import { getOfficesByCity } from "@/lib/offices";
import { layout } from "@/lib/ui";

export default async function CityPage({ params }) {
  const { city: rawCity } = await params; // params is a Promise in your Next version
  const city = decodeURIComponent(rawCity);

  const offices = getOfficesByCity(city);

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
              <div style={{ fontWeight: 900 }}>{o.name}</div>

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




const title = { margin: 0, fontSize: 26 };
const sub = { margin: "6px 0 14px 0", color: "#a9b3c7" };
const small = { color: "#a9b3c7", fontSize: 13, marginTop: 4 };



const pill = {
  height: "fit-content",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 999,
  padding: "8px 12px",
  color: "#a9b3c7",
  fontSize: 13,
};

