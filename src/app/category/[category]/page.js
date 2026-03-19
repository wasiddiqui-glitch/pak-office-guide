import Link from "next/link";
import { getOfficesByCategory } from "@/lib/offices";
import { layout } from "@/lib/ui";

export async function generateMetadata({ params }) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  return {
    title: `${category} Offices in Pakistan`,
    description: `Find all ${category} offices across Pakistan — requirements, steps, fees, and hours.`,
    openGraph: {
      title: `${category} Offices in Pakistan`,
      description: `Browse ${category} offices across all cities in Pakistan.`,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  const offices = getOfficesByCategory(category);

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        {/* Breadcrumbs */}
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/" style={{ ...layout.badge, textDecoration: "none" }}>
              Home
            </Link>
            <span style={layout.badge}>›</span>
            <Link href="/categories" style={{ ...layout.badge, textDecoration: "none" }}>
              Categories
            </Link>
            <span style={layout.badge}>›</span>
            <span style={layout.badge}>{category}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div>
              <h1 style={layout.h1}>{category}</h1>
              <p style={layout.sub}>{offices.length} office{offices.length !== 1 ? "s" : ""}</p>
            </div>
            <Link href="/categories" style={{ ...layout.pill, textDecoration: "none" }}>
              All categories
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {offices.map((o) => (
            <Link
              key={o.id}
              href={`/office/${o.id}`}
              style={{ ...layout.card, display: "block", textDecoration: "none" }}
            >
              <div style={{ fontWeight: 900 }}>{o.name}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                <span style={layout.badge}>{o.city}</span>
                <span style={layout.badge}>{o.area}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
