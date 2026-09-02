import { getOfficesByCity } from "@/lib/offices";
import { layout, space } from "@/lib/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import OfficeListItem from "@/components/OfficeListItem";

export async function generateMetadata({ params }) {
  const { city: rawCity } = await params;
  const city = decodeURIComponent(rawCity);
  return {
    title: `Government Offices in ${city}`,
    description: `Browse NADRA, Passport, Driving License, and other government offices in ${city}, Pakistan.`,
    openGraph: {
      title: `Government Offices in ${city}`,
      description: `Find requirements and steps for government offices in ${city}.`,
    },
  };
}

export default async function CityPage({ params }) {
  const { city: rawCity } = await params;
  const city = decodeURIComponent(rawCity);
  const offices = await getOfficesByCity(city);

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cities", href: "/cities" }]} />
        <PageHeader
          eyebrow="City"
          title={city}
          sub={`${offices.length} office${offices.length !== 1 ? "s" : ""}`}
          action={{ href: "/cities", label: "All cities" }}
        />

        <div style={{ display: "grid", gap: space.md }}>
          {offices.map((o) => (
            <OfficeListItem key={o.id} office={o} />
          ))}
        </div>
      </div>
    </main>
  );
}
