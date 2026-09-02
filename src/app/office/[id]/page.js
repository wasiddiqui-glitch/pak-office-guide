import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import CollapsibleSection from "@/components/CollapsibleSection";
import { getOfficeById } from "@/lib/offices";
import { layout, colors, type, space } from "@/lib/ui";
import FavoriteButton from "@/components/FavoriteButton";
import OpenNowBadge from "@/components/OpenNowBadge";
import ShareButton from "@/components/ShareButton";
import SuggestCorrectionButton from "@/components/SuggestCorrectionButton";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const office = await getOfficeById(id);
  if (!office) return { title: "Office not found" };
  return {
    title: `${office.name} — ${office.city}`,
    description: `Requirements, steps, and fees for ${office.name} in ${office.city}. ${office.address || ""}`.trim(),
    openGraph: {
      title: `${office.name} — ${office.city}`,
      description: `Find requirements, steps, and fees for ${office.name} in ${office.city}.`,
    },
  };
}

export default async function OfficePage({ params }) {
  const { id } = await params;
  const office = await getOfficeById(id);

  if (!office) {
    return (
      <main style={layout.page}>
        <div style={layout.container}>
          <div style={layout.card}>
            <h1 style={layout.h1}>Office not found</h1>
            <p style={layout.sub}>This office ID doesn&apos;t exist.</p>
            <Link href="/" style={layout.pill}>
              Go Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const maps =
  office.googleMapsLink ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${office.name} ${office.address} ${office.city}`
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
        <div style={{ display: "flex", gap: space.xs, flexWrap: "wrap", marginBottom: space.md }}>
          <Link href="/" className="ui-badge" style={layout.badge}>
            Home
          </Link>
          <span style={{ ...type.small, alignSelf: "center" }}>/</span>
          <Link href="/cities" className="ui-badge" style={layout.badge}>
            Cities
          </Link>
          <span style={{ ...type.small, alignSelf: "center" }}>/</span>
          <Link
            href={`/city/${encodeURIComponent(office.city)}`}
            className="ui-badge"
            style={layout.badge}
          >
            {office.city}
          </Link>
        </div>

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
            <p style={type.eyebrow}>{office.category}</p>
            <h1 style={type.h1}>{office.name}</h1>

            <div
              style={{
                display: "flex",
                gap: space.xs,
                flexWrap: "wrap",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <span style={layout.badge}>{office.city}</span>
              {office.area && <span style={layout.badge}>{office.area}</span>}
              <OpenNowBadge hours={office.hours} />
            </div>
          </div>

          <Link
            href={`/city/${encodeURIComponent(office.city)}`}
            className="ui-badge"
            style={layout.pill}
          >
            ← Back
          </Link>
        </div>

        {/* Actions (sticky) */}
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: space.sm, alignItems: "center" }}>
            {/* Primary */}
            <a href={maps} target="_blank" rel="noreferrer" className="ui-btn" style={actionPrimary}>
              Open in Maps
            </a>

            {/* Address copy — outline */}
            {office.address && (
              <CopyButton
                text={office.address}
                label="Copy address"
                style={actionOutline}
                className="ui-btn"
              />
            )}

            {/* Phone as plain link — browser detects and offers call/save */}
            {office.phone && (
              <a href={`tel:${office.phone}`} className="ui-btn" style={actionOutline}>
                {office.phone}
              </a>
            )}

            <ShareButton office={office} style={actionOutline} className="ui-btn" />
            <FavoriteButton id={office.id} bubbleStyle={actionOutline} className="ui-btn" />
            <SuggestCorrectionButton office={office} style={actionOutline} className="ui-btn" />
          </div>
        </div>

        {/* Collapsible sections */}
        <div style={{ display: "grid", gap: space.md }}>
          <CollapsibleSection title="Overview" defaultOpen>
            <div style={{ ...type.body, display: "grid", gap: space.xs }}>
              <div>
                <b style={{ color: colors.text }}>Address:</b>{" "}
                {office.address || "Not added yet"}
              </div>
              <div>
                <b style={{ color: colors.text }}>Hours:</b> {office.hours || "Not added yet"}
              </div>
              <div>
                <b style={{ color: colors.text }}>Website:</b>{" "}
                {office.website ? (
                  <a
                    href={office.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: colors.green, fontWeight: 600 }}
                  >
                    {office.website}
                  </a>
                ) : (
                  "Not added yet"
                )}
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Requirements" defaultOpen>
            {(office.requirements || []).length > 0 ? (
              <ul style={{ ...type.body, margin: 0, paddingLeft: 18, lineHeight: 1.75 }}>
                {(office.requirements || []).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              <div style={type.body}>No specific requirements listed yet.</div>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Steps" defaultOpen>
            {(office.steps || []).length > 0 ? (
              <ol style={{ ...type.body, margin: 0, paddingLeft: 18, lineHeight: 1.75 }}>
                {(office.steps || []).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ol>
            ) : (
              <div style={type.body}>No steps listed yet.</div>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Fees" defaultOpen>
            {(office.fees || []).length > 0 ? (
              <ul style={{ ...type.body, margin: 0, paddingLeft: 18, lineHeight: 1.75 }}>
                {(office.fees || []).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              <div style={type.body}>No fees listed yet.</div>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Notes" defaultOpen>
            {(office.notes || []).length > 0 ? (
              <ul style={{ ...type.body, margin: 0, paddingLeft: 18, lineHeight: 1.75 }}>
                {(office.notes || []).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              <div style={type.body}>No notes listed yet.</div>
            )}

            <div style={{ ...type.small, marginTop: space.sm }}>
              Always verify requirements with the official office/website before visiting.
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Verify before you visit" defaultOpen>
            <div style={type.body}>
              Requirements and timings can change. Always confirm with the official source or call
              the office.
            </div>

            <div style={{ height: space.sm }} />

            <div style={{ display: "flex", gap: space.sm, flexWrap: "wrap" }}>
              {office.website ? (
                <a
                  href={office.website}
                  target="_blank"
                  rel="noreferrer"
                  className="ui-pill"
                  style={layout.pill}
                >
                  Official website
                </a>
              ) : (
                <span style={layout.pill}>Official website: not added yet</span>
              )}

              {office.phone ? (
                <a href={`tel:${office.phone}`} className="ui-pill" style={layout.pill}>
                  Call: {office.phone}
                </a>
              ) : (
                <span style={layout.pill}>Phone: not added yet</span>
              )}
            </div>
          </CollapsibleSection>

          {office.lastUpdated && (
            <div style={{ color: colors.muted, fontSize: 12 }}>
              Last updated: {office.lastUpdated}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


