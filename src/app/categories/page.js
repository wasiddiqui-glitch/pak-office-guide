import Link from "next/link";
import { getCategories, getOfficeCountsByCategory } from "@/lib/offices";
import { layout, colors, type, space, grid } from "@/lib/ui";
import PageHeader from "@/components/PageHeader";

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([getCategories(), getOfficeCountsByCategory()]);

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <PageHeader
          eyebrow="Browse"
          title="Categories"
          sub="Browse offices by type."
          action={{ href: "/", label: "Home" }}
        />

        <div style={grid(260, space.md)}>
          {categories.map((cat) => {
            const count = counts[cat] || 0;
            return (
              <Link
                key={cat}
                href={`/category/${encodeURIComponent(cat)}`}
                className="ui-tile"
                style={{ ...layout.cityCard, display: "flex", alignItems: "center", gap: space.md }}
              >
                <div style={styles.icon}>{cat.charAt(0)}</div>
                <div>
                  <div style={type.h3}>{cat}</div>
                  <div style={{ ...type.small, marginTop: 2 }}>
                    {count} office{count !== 1 ? "s" : ""}
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
  icon: {
    fontSize: 20,
    fontWeight: 800,
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    background: "rgba(11,107,58,0.12)",
    border: "1px solid rgba(11,107,58,0.18)",
    color: colors.greenDark,
    flexShrink: 0,
  },
};
