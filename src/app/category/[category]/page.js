import { getOfficesByCategory } from "@/lib/offices";
import { layout, space } from "@/lib/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import OfficeListItem from "@/components/OfficeListItem";

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
  const offices = await getOfficesByCategory(category);

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories", href: "/categories" }]} />
        <PageHeader
          eyebrow="Category"
          title={category}
          sub={`${offices.length} office${offices.length !== 1 ? "s" : ""}`}
          action={{ href: "/categories", label: "All categories" }}
        />

        <div style={{ display: "grid", gap: space.md }}>
          {offices.map((o) => (
            <OfficeListItem key={o.id} office={o} hideCategory />
          ))}
        </div>
      </div>
    </main>
  );
}
