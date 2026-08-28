import Link from "next/link";
import { getCities } from "@/lib/offices";
import { layout } from "@/lib/ui";

export default async function CitiesPage() {
  const cities = await getCities();

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={layout.h1}>Cities</h1>
            <p style={layout.sub}>Pick a city to browse offices.</p>
          </div>

          <Link href="/" style={{ ...layout.pill, textDecoration: "none" }}>
            Home
          </Link>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {cities.map((c) => (
            <Link
              key={c}
              href={`/city/${encodeURIComponent(c)}`}
              style={{ ...layout.cityCard, display: "block", textDecoration: "none" }}
            >
              <div style={styles.cardRow}>
              <img
  src={`/cities/${c.toLowerCase()}.jpg`}
  alt={c}
  style={styles.cityImg}
/>

                <div>
                  <div style={{ fontWeight: 900 }}>{c}</div>
                  <div style={{ ...layout.sub, margin: "6px 0 0 0", fontSize: 13 }}>
                    View offices
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    margin: "0 0 14px 0",
  },
  cardRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  cityImg: {
    width: 70,
    height: 70,
    borderRadius: 14,
    objectFit: "cover",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.10)",
  },
};


