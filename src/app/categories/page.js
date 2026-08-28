import Link from "next/link";
import { getCategories, getOfficeCountsByCategory } from "@/lib/offices";
import { layout } from "@/lib/ui";

const CATEGORY_ICONS = {
  "NADRA": "🪪",
  "Passport": "📘",
  "Driving License": "🚗",
  "Utilities": "⚡",
  "Police": "🚔",
  "Excise": "🏛️",
  "Land": "🗺️",
  "Courts": "⚖️",
  "Post Office": "📮",
  "Traffic": "🚦",
};

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([getCategories(), getOfficeCountsByCategory()]);

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={layout.h1}>Categories</h1>
            <p style={layout.sub}>Browse offices by type.</p>
          </div>
          <Link href="/" style={{ ...layout.pill, textDecoration: "none" }}>
            Home
          </Link>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {categories.map((cat) => {
            const count = counts[cat] || 0;
            return (
              <Link
                key={cat}
                href={`/category/${encodeURIComponent(cat)}`}
                style={{ ...layout.cityCard, display: "block", textDecoration: "none" }}
              >
                <div style={styles.cardRow}>
                  <div style={styles.icon}>{CATEGORY_ICONS[cat] || "🏢"}</div>
                  <div>
                    <div style={{ fontWeight: 900 }}>{cat}</div>
                    <div style={{ ...layout.sub, margin: "4px 0 0 0", fontSize: 13 }}>
                      {count} office{count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
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
  icon: {
    fontSize: 36,
    width: 56,
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    background: "rgba(11,107,58,0.12)",
    border: "1px solid rgba(11,107,58,0.18)",
    flexShrink: 0,
  },
};
