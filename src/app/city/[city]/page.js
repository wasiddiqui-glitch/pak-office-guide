import Link from "next/link";
import { getOfficesByCity } from "@/lib/offices";
import { layout } from "@/lib/ui";

export default async function CityPage({ params }) {
  const { city: rawCity } = await params; // ✅ params is a Promise
  const city = decodeURIComponent(rawCity);

  const offices = getOfficesByCity(city);

  return (
    <main style={page}>
      <div style={layout.container}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <h1 style={title}>{city}</h1>
          <p style={sub}>{offices.length} office(s)</p>
        </div>
        <Link href="/cities" style={pill}>All cities</Link>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {offices.map((o) => (
          <Link key={o.id} href={`/office/${o.id}`} style={card}>
            <div style={{ fontWeight: 800 }}>{o.name}</div>
            <div style={small}>{o.category} • {o.area}</div>
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

const title = { margin: 0, fontSize: 26 };
const sub = { margin: "6px 0 14px 0", color: "#a9b3c7" };
const small = { color: "#a9b3c7", fontSize: 13, marginTop: 4 };

const card = {
  display: "block",
  padding: 14,
  borderRadius: 16,
  background: "#121a2a",
  border: "1px solid rgba(255,255,255,0.08)",
};

const pill = {
  height: "fit-content",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 999,
  padding: "8px 12px",
  color: "#a9b3c7",
  fontSize: 13,
};

