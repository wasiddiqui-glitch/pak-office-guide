import { layout } from "@/lib/ui";
import Link from "next/link";
import { getCities } from "@/lib/offices";

export default function CitiesPage() {
  const cities = getCities();

  return (
    <main style={page}>
      <div style={layout.container}>
      <div style={headerRow}>
        <div>
          <h1 style={title}>Cities</h1>
          <p style={sub}>Pick a city to browse offices.</p>
        </div>
        <Link href="/" style={pill}>Home</Link>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {cities.map((c) => (
          <Link key={c} href={`/city/${encodeURIComponent(c)}`} style={card}>
            <div style={{ fontWeight: 800 }}>{c}</div>
            <div style={small}>View offices</div>
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

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  maxWidth: 900,
  margin: "0 auto 14px auto",
};

const title = { margin: 0, fontSize: 26 };
const sub = { margin: "6px 0 0 0", color: "#a9b3c7" };
const small = { color: "#a9b3c7", fontSize: 13, marginTop: 4 };

const card = {
  display: "block",
  padding: 14,
  borderRadius: 16,
  background: "#121a2a",
  border: "1px solid rgba(255,255,255,0.08)",
  maxWidth: 900,
  margin: "0 auto",
};

const pill = {
  height: "fit-content",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 999,
  padding: "8px 12px",
  color: "#a9b3c7",
  fontSize: 13,
};
