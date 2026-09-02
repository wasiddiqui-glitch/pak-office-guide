import Link from "next/link";
import Image from "next/image";
import { getCities } from "@/lib/offices";
import { layout, type, space, grid } from "@/lib/ui";
import PageHeader from "@/components/PageHeader";

export default async function CitiesPage() {
  const cities = await getCities();

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <PageHeader
          eyebrow="Browse"
          title="Cities"
          sub="Pick a city to browse its government offices."
          action={{ href: "/", label: "Home" }}
        />

        <div style={grid(260, space.md)}>
          {cities.map((c) => (
            <Link
              key={c}
              href={`/city/${encodeURIComponent(c)}`}
              className="ui-tile"
              style={{ ...layout.cityCard, display: "flex", alignItems: "center", gap: space.md }}
            >
              <Image
                src={`/cities/${c.toLowerCase()}.jpg`}
                alt=""
                width={70}
                height={70}
                style={styles.cityImg}
              />
              <div>
                <div style={type.h3}>{c}</div>
                <div style={{ ...type.small, marginTop: 2 }}>View offices</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

const styles = {
  cityImg: {
    borderRadius: 14,
    objectFit: "cover",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.10)",
    flexShrink: 0,
  },
};
