import Link from "next/link";
import Image from "next/image";
import { getCities, getCategories, getOfficeCountsByCategory } from "@/lib/offices";
import { getAllEmbassies } from "@/lib/embassies";
import { layout, type, space, grid, colors } from "@/lib/ui";

export default async function HomePage() {
  const [cities, categories, officeCounts, embassies] = await Promise.all([
    getCities(),
    getCategories(),
    getOfficeCountsByCategory(),
    getAllEmbassies(),
  ]);
  const officeCount = Object.values(officeCounts).reduce((a, b) => a + b, 0);

  const quickLinks = [
    { href: "/search", label: "Search", variant: "primary" },
    { href: "/guides", label: "Guides", variant: "primary" },
    { href: "/overseas", label: "Overseas", variant: "primary" },
    { href: "/cities", label: "Browse Cities", variant: "soft" },
    { href: "/categories", label: "Browse Categories", variant: "soft" },
  ];

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <header style={styles.hero}>
          <div style={styles.heroRow}>
            <Image
              src="/pakistan.png"
              alt="Pakistan flag"
              width={72}
              height={48}
              style={{ objectFit: "cover", borderRadius: 6, background: "white", padding: 3 }}
              priority
            />
            <div>
              <p style={type.eyebrow}>Pakistan Office Guide</p>
              <h1 style={{ ...type.display, marginTop: 4 }}>
                Government offices, made findable.
              </h1>
            </div>
          </div>
          <p style={{ ...type.body, maxWidth: 560, marginTop: space.sm }}>
            Requirements, steps, fees, and hours for government offices across Pakistan — and for
            Pakistani missions abroad.
          </p>

          <div style={styles.statRow}>
            <span style={layout.badge}>{officeCount} offices</span>
            <span style={layout.badge}>{cities.length} cities</span>
            <span style={layout.badge}>{embassies.length} missions abroad</span>
          </div>
        </header>

        <section style={{ ...grid(150, space.sm), marginTop: space.xl }}>
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="ui-btn"
              style={l.variant === "primary" ? layout.buttonPrimary : layout.buttonSoft}
            >
              {l.label}
            </Link>
          ))}
        </section>

        <section className="home-columns" style={{ ...styles.grid2, marginTop: space.xl }}>
          <div style={layout.cityCard}>
            <p style={type.eyebrow}>Browse</p>
            <h2 style={{ ...type.h2, marginTop: 4, marginBottom: space.md }}>Cities</h2>
            <div style={grid(130, space.sm)}>
              {cities.map((c) => (
                <Link
                  key={c}
                  href={`/city/${encodeURIComponent(c)}`}
                  className="ui-tile"
                  style={{ ...layout.card, padding: space.md, textDecoration: "none" }}
                >
                  <div style={type.h3}>{c}</div>
                  <div style={{ ...type.small, marginTop: 4 }}>View offices</div>
                </Link>
              ))}
            </div>
          </div>

          <div style={layout.card}>
            <p style={type.eyebrow}>Browse</p>
            <h2 style={{ ...type.h2, marginTop: 4, marginBottom: space.md }}>Categories</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: space.sm }}>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${encodeURIComponent(cat)}`}
                  className="ui-badge"
                  style={{ ...layout.badge, textDecoration: "none" }}
                >
                  {cat}
                  {!!officeCounts[cat] && (
                    <span style={{ opacity: 0.65 }}> · {officeCounts[cat]}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <span>Always verify details with the official office before visiting.</span>
        </footer>
      </div>
    </main>
  );
}

const styles = {
  hero: {
    maxWidth: 900,
    margin: "0 auto",
  },
  heroRow: {
    display: "flex",
    alignItems: "center",
    gap: space.md,
  },
  statRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.sm,
    marginTop: space.lg,
  },
  grid2: {
    maxWidth: 900,
    margin: "0 auto",
    display: "grid",
    gap: space.md,
    gridTemplateColumns: "1fr",
  },
  footer: {
    maxWidth: 900,
    margin: `${space.xxl}px auto 0 auto`,
    ...type.small,
    color: colors.muted,
    textAlign: "center",
  },
};
