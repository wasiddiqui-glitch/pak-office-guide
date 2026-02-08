import Link from "next/link";
import offices from "@/data/offices.json";
import { layout } from "@/lib/ui";

export default function HomePage() {
  const cities = Array.from(new Set(offices.map((o) => o.city))).sort();
  const categories = Array.from(new Set(offices.map((o) => o.category))).sort();

  return (
    <main style={layout.page}>
      <div style={layout.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Pakistan Office Guide</h1>
          <p style={styles.sub}>
            Requirements & steps for government offices (English).
          </p>
        </div>
        <div style={styles.pill}>v1</div>
      </header>

      <section style={styles.card}>
        <h2 style={styles.h2}>Quick Start</h2>
        <div style={styles.row}>
          <Link href="/search" style={styles.button}>
            Search
          </Link>
          <Link href="/cities" style={styles.button}>
            Browse Cities
          </Link>
        </div>
        <p style={styles.small}>
          Right now you have <b>{offices.length}</b> office(s) in your database.
        </p>
      </section>

      <section style={styles.grid2}>
        <div style={styles.card}>
          <h2 style={styles.h2}>Cities</h2>
          <div style={styles.grid}>
            {cities.map((c) => (
              <Link key={c} href={`/city/${encodeURIComponent(c)}`} style={styles.linkCard}>
                <div style={{ fontWeight: 800 }}>{c}</div>
                <div style={styles.small}>View offices</div>
              </Link>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.h2}>Categories</h2>
          <div style={styles.grid}>
            {categories.map((cat) => (
              <div key={cat} style={styles.pillSoft}>
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
  page: {
    minHeight: "100vh",
    background: "#0b0f19",
    color: "#e7ecf5",
    padding: 18,
    paddingBottom: 90,

    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    maxWidth: 900,
    margin: "0 auto 14px auto",
  },
  title: { margin: 0, fontSize: 26, letterSpacing: 0.2 },
  sub: { margin: "6px 0 0 0", color: "#a9b3c7", fontSize: 14 },
  pill: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 999,
    padding: "8px 12px",
    color: "#a9b3c7",
    fontSize: 13,
    height: "fit-content",
  },
  pillSoft: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 999,
    padding: "8px 12px",
    background: "rgba(255,255,255,0.03)",
    color: "#a9b3c7",
    fontSize: 13,
    width: "fit-content",
  },
  card: {
    maxWidth: 900,
    margin: "0 auto 12px auto",
    background: "#121a2a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
  },
  h2: { margin: "0 0 10px 0", fontSize: 16 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  button: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(93,214,255,0.14)",
    fontWeight: 700,
  },
  small: { margin: "10px 0 0 0", color: "#a9b3c7", fontSize: 13, lineHeight: 1.5 },
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

