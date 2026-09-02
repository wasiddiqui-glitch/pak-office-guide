import Link from "next/link";
import { getAllGuides } from "@/lib/guides";
import { getEmbassiesByRegion } from "@/lib/embassies";
import { layout, colors, type, space } from "@/lib/ui";
import CollapsibleSection from "@/components/CollapsibleSection";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Overseas Pakistanis",
  description:
    "Guides for Pakistanis living abroad — NICOP, POC card, Power of Attorney, property transfer, and embassy contacts across the US, UK, Canada, UAE, and more.",
  openGraph: {
    title: "Overseas Pakistanis | Pakistan Office Guide",
    description:
      "Guides for Pakistanis living abroad — NICOP, POC card, Power of Attorney, property transfer, and embassy contacts.",
  },
};

const OVERSEAS_SLUGS = [
  "nicop-overseas-pakistanis",
  "poc-card-overseas",
  "power-of-attorney-abroad",
  "transfer-property-via-poa",
];

const KEY_RESOURCES = [
  {
    label: "NADRA Online Portal (id.nadra.gov.pk)",
    desc: "Apply for NICOP, POC, and other NADRA services online",
  },
  {
    label: "FBR IRIS (iris.fbr.gov.pk)",
    desc: "File your Pakistani tax return as an overseas Pakistani",
  },
  {
    label: "Overseas Investors Chamber (oicci.org)",
    desc: "For business and investment queries by overseas Pakistanis",
  },
];

export default async function OverseasPage() {
  const allGuides = await getAllGuides();
  const overseasGuides = OVERSEAS_SLUGS.map((slug) => allGuides.find((g) => g.slug === slug)).filter(
    Boolean
  );

  const byRegion = await getEmbassiesByRegion();
  const regionOrder = ["Middle East", "Europe", "North America", "Asia-Pacific"];

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }]} />
        <PageHeader
          eyebrow="For the diaspora"
          title="Overseas Pakistanis"
          sub="Living abroad and need to handle things back home? NICOP renewal, Power of Attorney, property transfers, POC cards — everything in one place."
        />

        <div style={{ display: "grid", gap: space.md }}>
          <CollapsibleSection title="Guides for overseas Pakistanis" defaultOpen>
            <div style={{ display: "grid", gap: space.md }}>
              {overseasGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="ui-tile"
                  style={{ ...layout.card, display: "block", textDecoration: "none" }}
                >
                  <div style={{ ...type.h3, fontSize: 15, color: colors.text, marginBottom: 4 }}>
                    {guide.title}
                  </div>
                  <div style={{ ...type.small, marginBottom: space.sm }}>{guide.summary}</div>
                  <div style={{ display: "flex", gap: space.xs, flexWrap: "wrap" }}>
                    <span style={layout.badge}>{guide.category}</span>
                    <span style={layout.badge}>{guide.estimatedTime}</span>
                    <span style={layout.badge}>{guide.totalFees}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Key resources" defaultOpen>
            <div style={{ display: "grid", gap: space.sm }}>
              {KEY_RESOURCES.map((item) => (
                <div key={item.label} style={{ ...layout.card, padding: space.md }}>
                  <div style={{ ...type.h3, color: colors.text }}>{item.label}</div>
                  <div style={{ ...type.small, marginTop: 4 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {regionOrder.map((region) => {
            const list = byRegion[region];
            if (!list?.length) return null;
            return (
              <CollapsibleSection
                key={region}
                title={`Pakistani missions — ${region}`}
                defaultOpen={false}
              >
                <div style={{ display: "grid", gap: space.sm }}>
                  {list.map((e) => (
                    <Link
                      key={e.id}
                      href={`/overseas/embassy/${e.id}`}
                      className="ui-tile"
                      style={{ ...layout.card, display: "block", textDecoration: "none", padding: space.md }}
                    >
                      <div style={{ ...type.h3, color: colors.text }}>{e.name}</div>
                      <div style={{ ...type.small, marginTop: 2 }}>
                        {e.city}, {e.country}
                      </div>
                      <div style={{ display: "flex", gap: space.xs, flexWrap: "wrap", marginTop: space.sm }}>
                        {e.nadraDesk && <span style={layout.badge}>NADRA desk</span>}
                        {e.passportServices && <span style={layout.badge}>Passport</span>}
                        {e.nicopServices && <span style={layout.badge}>NICOP</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </CollapsibleSection>
            );
          })}

          <div style={type.small}>
            Embassy contact details may change — always verify with the official Pakistani embassy
            website or call ahead before visiting.
          </div>
        </div>
      </div>
    </main>
  );
}
