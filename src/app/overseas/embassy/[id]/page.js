import Link from "next/link";
import CollapsibleSection from "@/components/CollapsibleSection";
import CopyButton from "@/components/CopyButton";
import ShareButton from "@/components/ShareButton";
import { getEmbassyById, getAllEmbassies } from "@/lib/embassies";
import { layout, colors } from "@/lib/ui";

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
            <h1 style={layout.h1}>Mission not found</h1>
            <Link href="/overseas" style={layout.pill}>← Overseas</Link>
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

        {/* Breadcrumbs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Link href="/" style={layout.badge}>Home</Link>
          <span style={layout.badge}>›</span>
          <Link href="/overseas" style={layout.badge}>Overseas</Link>
          <span style={layout.badge}>›</span>
          <span style={layout.badge}>{e.city}</span>
        </div>

        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <h1 style={{ ...layout.h1, fontSize: 22 }}>{e.name}</h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={layout.badge}>{e.country}</span>
              <span style={layout.badge}>{e.region}</span>
              {e.nadraDesk && <span style={layout.badge}>NADRA desk</span>}
            </div>
          </div>
          <Link href="/overseas" style={layout.pill}>← Back</Link>
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
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <a href={mapsUrl} target="_blank" rel="noreferrer" style={actionPrimary}>
              📍 Open in Maps
            </a>

            {e.address && (
              <CopyButton text={e.address} label="Copy address" style={actionOutline} />
            )}

            {e.phone && (
              <a href={`tel:${e.phone}`} style={actionOutline}>
                📞 {e.phone}
              </a>
            )}

            <ShareButton office={{ name: e.name, city: e.city, address: e.address }} style={actionOutline} />
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "grid", gap: 12 }}>

          <CollapsibleSection title="Overview" icon="ℹ️" defaultOpen>
            <div style={{ color: colors.muted, fontSize: 14, lineHeight: 1.8, display: "grid", gap: 4 }}>
              <div><b style={{ color: colors.text }}>Address:</b> {e.address}</div>
              <div><b style={{ color: colors.text }}>Country:</b> {e.country}</div>
              <div><b style={{ color: colors.text }}>Hours:</b> {e.hours || "Verify with the mission"}</div>
              {e.website && (
                <div>
                  <b style={{ color: colors.text }}>Website:</b>{" "}
                  <span style={{ color: colors.muted }}>{e.website}</span>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {e.services?.length > 0 && (
            <CollapsibleSection title="Services available" icon="🛂" defaultOpen>
              <ul style={{ margin: 0, paddingLeft: 18, color: colors.muted, lineHeight: 1.8 }}>
                {e.services.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </CollapsibleSection>
          )}

          {e.requirements?.length > 0 && (
            <CollapsibleSection title="What to bring" icon="🪪" defaultOpen>
              <ul style={{ margin: 0, paddingLeft: 18, color: colors.muted, lineHeight: 1.8 }}>
                {e.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </CollapsibleSection>
          )}

          {e.steps?.length > 0 && (
            <CollapsibleSection title="How to visit" icon="🪜" defaultOpen>
              <div style={{ display: "grid", gap: 14 }}>
                {e.steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 14 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: colors.green,
                        color: "white",
                        fontWeight: 900,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div style={{ color: colors.muted, fontSize: 14, lineHeight: 1.6, paddingTop: 4 }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {e.fees?.length > 0 && (
            <CollapsibleSection title="Fees" icon="💵" defaultOpen>
              <ul style={{ margin: 0, paddingLeft: 18, color: colors.muted, lineHeight: 1.8 }}>
                {e.fees.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </CollapsibleSection>
          )}

          {e.notes?.length > 0 && (
            <CollapsibleSection title="Notes" icon="📝" defaultOpen>
              <ul style={{ margin: 0, paddingLeft: 18, color: colors.muted, lineHeight: 1.8 }}>
                {e.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
              <div style={{ marginTop: 10, fontSize: 12, color: colors.muted }}>
                Always verify hours and requirements with the official mission before visiting.
              </div>
            </CollapsibleSection>
          )}

          <CollapsibleSection title="Verify before you visit" icon="✅" defaultOpen>
            <div style={{ color: colors.muted, lineHeight: 1.6, fontSize: 14 }}>
              Embassy hours, fees, and procedures can change. Always confirm by calling ahead or checking
              the official Pakistani mission website.
            </div>
            <div style={{ height: 10 }} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {e.phone ? (
                <a href={`tel:${e.phone}`} style={layout.pill}>📞 Call: {e.phone}</a>
              ) : (
                <span style={layout.pill}>Phone: not listed</span>
              )}
              {e.website ? (
                <span style={layout.pill}>🌐 {e.website}</span>
              ) : (
                <span style={layout.pill}>Website: not listed</span>
              )}
            </div>
          </CollapsibleSection>

          {e.lastUpdated && (
            <div style={{ color: colors.muted, fontSize: 12 }}>
              Last updated: {e.lastUpdated}. Fees and procedures can change — verify with the mission directly.
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
