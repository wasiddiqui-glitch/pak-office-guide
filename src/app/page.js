import Link from "next/link";
import offices from "@/data/offices.json";
import { layout } from "@/lib/ui";

export default function HomePage() {
  const cities = Array.from(new Set(offices.map((o) => o.city))).sort();
  const categories = Array.from(new Set(offices.map((o) => o.category))).sort();

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
      <header style={styles.header}>
        <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
  <img
    src="/pakistan.png"
    alt="Pakistan"
    style={{
      width: 105,
      height: 70,
      objectFit: "cover",
      borderRadius: 1,
      background: "white",
      padding: 3,
    }}
  />
  <div>
    <h1 style={styles.title}>Pakistan Office Guide</h1>
    <p style={styles.sub}>
      Requirements & steps for government offices (English).
    </p>
  </div>
</div>

        </div>
        <div style={layout.pill}>v1</div>
      </header>

      <section style={layout.card}>
        <h2 style={styles.h2}>Quick Start</h2>
        <div style={styles.row}>
          <Link href="/search" style={layout.buttonPrimary}>
            Search
          </Link>
          <Link href="/cities" style={layout.buttonSoft}>
            Browse Cities
          </Link>
        </div>

      </section>

      
      <section style={{ ...styles.grid2, marginTop: 15 }}>
        <div style={styles.card}>
          <h2 style={styles.h2}>Cities</h2>
          <div style={styles.grid}>
            {cities.map((c) => (
              <Link
              key={c}
              href={`/city/${encodeURIComponent(c)}`}
              style={{ ...layout.card, padding: 12, textDecoration: "none" }}
            >
              <div style={{ fontWeight: 800 }}>{c}</div>
              <div style={styles.small}>View offices</div>
            </Link>
            
            ))}
          </div>
        </div>

        <div style={layout.card}>
          <h2 style={styles.h2}>Categories</h2>
          <div style={styles.grid}>
            {categories.map((cat) => (
              <div key={cat} style={layout.badge}>
                {cat}
              </div>
            ))}
          </div>
          <p style={styles.small}>
            Next: add Passport, Traffic, Utilities, etc.
          </p>
        </div>
      </section>
      </div>
    </main>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    maxWidth: 900,
    margin: "0 auto 14px auto",
  },
  title: { margin: 0, fontSize: 26, letterSpacing: 0.2 },
  sub: { margin: "6px 0 0 0", color: "inherit", opacity: 0.75, fontSize: 14 },
  
  pillSoft: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 999,
    padding: "8px 12px",
    background: "rgba(255,255,255,0.03)",
    color: "#a9b3c7",
    fontSize: 13,
    width: "fit-content",
  },

  h2: { margin: "0 0 10px 0", fontSize: 16 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

  small: { margin: "10px 0 0 0", opacity: 0.75, fontSize: 13, lineHeight: 1.5 },

  grid2: {
    maxWidth: 900,
    margin: "0 auto",
    display: "grid",
    gap: 12,
    gridTemplateColumns: "1fr",
  },
  grid: { display: "grid", gap: 10 },
  linkCard: {
    display: "block",
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
  },
};

