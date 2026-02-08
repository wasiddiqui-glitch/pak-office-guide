import Link from "next/link";
import { getOfficeById } from "@/lib/offices";
import { layout } from "@/lib/ui";

export default async function OfficePage({ params }) {
  const { id } = await params; // ✅ params is a Promise in your Next.js version
  const office = getOfficeById(id);

  if (!office) {
    return (
      <main style={page}>
        <div style={layout.container}>
        <div style={card}>
          <h1 style={title}>Office not found</h1>
          <p style={sub}>Check the ID in src/data/offices.json</p>
          <Link href="/" style={button}>Go Home</Link>
        </div>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={topRow}>
        <div>
          <h1 style={title}>{office.name}</h1>
          <p style={sub}>
            {office.city} • {office.area} • {office.category}
          </p>
        </div>
        <Link href={`/city/${encodeURIComponent(office.city)}`} style={pill}>
          Back
        </Link>
      </div>

      <div style={card}>
        <div style={small}><b>Hours:</b> {office.hours}</div>
        <div style={small}><b>Address:</b> {office.address}</div>

        <div style={{ height: 10 }} />

        <a
          href={office.googleMapsLink}
          target="_blank"
          rel="noreferrer"
          style={button}
        >
          Open in Maps
        </a>
      </div>

      <div style={card}>
        <h2 style={h2}>Requirements</h2>
        <ul style={list}>
          {office.requirements.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>

      <div style={card}>
        <h2 style={h2}>Steps</h2>
        <ol style={list}>
          {office.steps.map((x, i) => <li key={i}>{x}</li>)}
        </ol>
      </div>

      <div style={card}>
        <h2 style={h2}>Fees</h2>
        <ul style={list}>
          {office.fees.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>

      <div style={card}>
        <h2 style={h2}>Notes</h2>
        <ul style={list}>
          {office.notes.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>

      <p style={{ ...small, marginTop: 12 }}>
        Last updated: {office.lastUpdated}
      </p>
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

const title = { margin: 0, fontSize: 24 };
const sub = { margin: "6px 0 14px 0", color: "#a9b3c7" };
const h2 = { margin: "0 0 10px 0", fontSize: 16 };
const small = { color: "#a9b3c7", fontSize: 13, lineHeight: 1.5 };
const list = { margin: 0, paddingLeft: 18 };

const card = {
  padding: 14,
  borderRadius: 16,
  background: "#121a2a",
  border: "1px solid rgba(255,255,255,0.08)",
  marginBottom: 12,
};

const button = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(93,214,255,0.14)",
  fontWeight: 700,
};

const pill = {
  height: "fit-content",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 999,
  padding: "8px 12px",
  color: "#a9b3c7",
  fontSize: 13,
};
