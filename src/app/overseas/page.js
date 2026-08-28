import Link from "next/link";
import { getAllGuides } from "@/lib/guides";
import { getEmbassiesByRegion } from "@/lib/embassies";
import { layout, colors } from "@/lib/ui";
import CollapsibleSection from "@/components/CollapsibleSection";

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

const countryFlag = {
  "United States":        "🇺🇸",
  "Canada":               "🇨🇦",
  "United Kingdom":       "🇬🇧",
  "Germany":              "🇩🇪",
  "Norway":               "🇳🇴",
  "United Arab Emirates": "🇦🇪",
  "Saudi Arabia":         "🇸🇦",
  "Australia":            "🇦🇺",
};

const OVERSEAS_SLUGS = [
  "nicop-overseas-pakistanis",
  "poc-card-overseas",
  "power-of-attorney-abroad",
  "transfer-property-via-poa",
];

export default async function OverseasPage() {
  const allGuides = await getAllGuides();
  const overseasGuides = OVERSEAS_SLUGS.map((slug) =>
    allGuides.find((g) => g.slug === slug)
  ).filter(Boolean);

  const byRegion = await getEmbassiesByRegion();
  const regionOrder = ["Middle East", "Europe", "North America", "Asia-Pacific"];

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>

        {/* Breadcrumbs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <Link href="/" style={layout.badge}>Home</Link>
          <span style={layout.badge}>›</span>
          <span style={layout.badge}>Overseas Pakistanis</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 36, lineHeight: 1 }}>✈️</span>
            <h1 style={{ ...layout.h1, fontSize: 24 }}>Overseas Pakistanis</h1>
          </div>
          <p style={{ ...layout.sub, margin: 0, maxWidth: 620 }}>
            Living abroad and need to handle things back home? NICOP renewal, Power of Attorney,
            property transfers, POC cards — everything in one place.
          </p>
        </div>

        <div style={{ display: "grid", gap: 12 }}>

          {/* Guides */}
          <CollapsibleSection title="Guides for overseas Pakistanis" icon="📋" defaultOpen>
            <div style={{ display: "grid", gap: 12 }}>
              {overseasGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  style={{ ...layout.card, display: "block", textDecoration: "none" }}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{guide.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 900, fontSize: 15, color: colors.text, marginBottom: 4 }}>
                        {guide.title}
                      </div>
                      <div style={{ color: colors.muted, fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
                        {guide.summary}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={layout.badge}>{guide.category}</span>
                        <span style={layout.badge}>⏱ {guide.estimatedTime}</span>
                        <span style={layout.badge}>💰 {guide.totalFees}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CollapsibleSection>

          {/* Quick links */}
          <CollapsibleSection title="Key resources" icon="🔗" defaultOpen>
            <div style={{ display: "grid", gap: 10 }}>
              {[
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
              ].map((item) => (
                <div key={item.label} style={{ ...layout.card, padding: 12 }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: colors.text }}>
                    {item.label}
                  </div>
                  <div style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Embassies by region */}
          {regionOrder.map((region) => {
            const list = byRegion[region];
            if (!list?.length) return null;
            return (
              <CollapsibleSection
                key={region}
                title={`Pakistani missions — ${region}`}
                icon="🏛️"
                defaultOpen={false}
              >
                <div style={{ display: "grid", gap: 10 }}>
                  {list.map((e) => (
                    <Link
                      key={e.id}
                      href={`/overseas/embassy/${e.id}`}
                      style={{ ...layout.card, display: "block", textDecoration: "none", padding: 12 }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>
                          {countryFlag[e.country] || "🏛️"}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 900, fontSize: 14, color: colors.text }}>
                            {e.name}
                          </div>
                          <div style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
                            {e.city}, {e.country}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
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

          {/* Disclaimer */}
          <div style={{ color: colors.muted, fontSize: 12, lineHeight: 1.6 }}>
            Embassy contact details may change — always verify with the official Pakistani embassy website or call ahead before visiting.
          </div>

        </div>
      </div>
    </main>
  );
}
