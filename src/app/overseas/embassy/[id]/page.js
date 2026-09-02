import Link from "next/link";
import CollapsibleSection from "@/components/CollapsibleSection";
import CopyButton from "@/components/CopyButton";
import ShareButton from "@/components/ShareButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import StepList from "@/components/StepList";
import { getEmbassyById, getAllEmbassies } from "@/lib/embassies";
import { layout, colors, type, space } from "@/lib/ui";

export async function generateStaticParams() {
  const embassies = await getAllEmbassies();
  return embassies.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const e = await getEmbassyById(id);
  if (!e) return { title: "Mission not found" };
  return {
    title: `${e.name} — ${e.city}`,
    description: `Consular services, requirements, fees, and contact details for the ${e.name} in ${e.city}, ${e.country}.`,
    openGraph: {
      title: `${e.name} — ${e.city}`,
      description: `Passport, NICOP, attestation, and other services at the Pakistani mission in ${e.city}.`,
    },
  };
}

export default async function EmbassyPage({ params }) {
  const { id } = await params;
  const e = await getEmbassyById(id);

  if (!e) {
    return (
      <main style={layout.page}>
        <div style={layout.container}>
          <div style={layout.card}>
            <h1 style={type.h1}>Mission not found</h1>
            <Link href="/overseas" className="ui-badge" style={layout.pill}>
              ← Overseas
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${e.name} ${e.address} ${e.country}`
  )}`;

  const actionPrimary = {
    ...layout.buttonPrimary,
    padding: "10px 16px",
    borderRadius: 999,
    fontSize: 14,
    gap: 6,
    textDecoration: "none",
  };

  const actionOutline = {
    ...layout.card,
    padding: "10px 14px",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    fontSize: 14,
    background: "transparent",
    cursor: "pointer",
  };

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Overseas", href: "/overseas" },
          ]}
        />

        {/* Title row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: space.md,
            marginBottom: space.md,
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "grid", gap: space.xs }}>
            <p style={type.eyebrow}>{e.country}</p>
            <h1 style={type.h1}>{e.name}</h1>
            <div style={{ display: "flex", gap: space.xs, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
              <span style={layout.badge}>{e.city}</span>
              <span style={layout.badge}>{e.region}</span>
              {e.nadraDesk && <span style={layout.badge}>NADRA desk</span>}
            </div>
          </div>
          <Link href="/overseas" className="ui-badge" style={layout.pill}>
            ← Back
          </Link>
        </div>

        {/* Sticky actions */}
        <div
          style={{
            position: "sticky",
            top: 12,
            zIndex: 20,
            background: "rgba(246,248,247,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            paddingTop: 6,
            paddingBottom: 10,
            marginBottom: space.md,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: space.sm, alignItems: "center" }}>
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="ui-btn" style={actionPrimary}>
              Open in Maps
            </a>

            {e.address && (
              <CopyButton text={e.address} label="Copy address" style={actionOutline} className="ui-btn" />
            )}

            {e.phone && (
              <a href={`tel:${e.phone}`} className="ui-btn" style={actionOutline}>
                {e.phone}
              </a>
            )}

            <ShareButton
              office={{ name: e.name, city: e.city, address: e.address }}
              style={actionOutline}
              className="ui-btn"
            />
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "grid", gap: space.md }}>
          <CollapsibleSection title="Overview" defaultOpen>
            <div style={{ ...type.body, display: "grid", gap: space.xs }}>
              <div>
                <b style={{ color: colors.text }}>Address:</b> {e.address}
              </div>
              <div>
                <b style={{ color: colors.text }}>Country:</b> {e.country}
              </div>
              <div>
                <b style={{ color: colors.text }}>Hours:</b> {e.hours || "Verify with the mission"}
              </div>
              {e.website && (
                <div>
                  <b style={{ color: colors.text }}>Website:</b> {e.website}
                </div>
              )}
            </div>
          </CollapsibleSection>

          {e.services?.length > 0 && (
            <CollapsibleSection title="Services available" defaultOpen>
              <ul style={{ ...type.body, margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                {e.services.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {e.requirements?.length > 0 && (
            <CollapsibleSection title="What to bring" defaultOpen>
              <ul style={{ ...type.body, margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                {e.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {e.steps?.length > 0 && (
            <CollapsibleSection title="How to visit" defaultOpen>
              <StepList steps={e.steps} />
            </CollapsibleSection>
          )}

          {e.fees?.length > 0 && (
            <CollapsibleSection title="Fees" defaultOpen>
              <ul style={{ ...type.body, margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                {e.fees.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {e.notes?.length > 0 && (
            <CollapsibleSection title="Notes" defaultOpen>
              <ul style={{ ...type.body, margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                {e.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
              <div style={{ ...type.small, marginTop: space.sm }}>
                Always verify hours and requirements with the official mission before visiting.
              </div>
            </CollapsibleSection>
          )}

          <CollapsibleSection title="Verify before you visit" defaultOpen>
            <div style={type.body}>
              Embassy hours, fees, and procedures can change. Always confirm by calling ahead or
              checking the official Pakistani mission website.
            </div>
            <div style={{ height: space.sm }} />
            <div style={{ display: "flex", gap: space.sm, flexWrap: "wrap" }}>
              {e.phone ? (
                <a href={`tel:${e.phone}`} className="ui-pill" style={layout.pill}>
                  Call: {e.phone}
                </a>
              ) : (
                <span style={layout.pill}>Phone: not listed</span>
              )}
              {e.website ? (
                <span style={layout.pill}>{e.website}</span>
              ) : (
                <span style={layout.pill}>Website: not listed</span>
              )}
            </div>
          </CollapsibleSection>

          {e.lastUpdated && (
            <div style={type.small}>
              Last updated: {e.lastUpdated}. Fees and procedures can change — verify with the
              mission directly.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
