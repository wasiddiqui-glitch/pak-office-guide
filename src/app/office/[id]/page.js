import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import CollapsibleSection from "@/components/CollapsibleSection";
import { getOfficeById } from "@/lib/offices";
import { layout, colors } from "@/lib/ui";
import FavoriteButton from "@/components/FavoriteButton";
import OpenNowBadge from "@/components/OpenNowBadge";
import ShareButton from "@/components/ShareButton";
import SuggestCorrectionButton from "@/components/SuggestCorrectionButton";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const office = getOfficeById(id);
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
  const office = getOfficeById(id);

  if (!office) {
    return (
      <main style={layout.page}>
        <div style={layout.container}>
          <div style={layout.card}>
            <h1 style={layout.h1}>Office not found</h1>
            <p style={layout.sub}>Check the ID in src/data/offices.json</p>
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

  // Reusable "bubble" style (matches your Open in Maps pill-card)
  const actionBubble = {
  ...layout.card,
  padding: "10px 14px",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",   // ✅ center content
  gap: 8,
  borderRadius: 999,          // ✅ more pill-like
  minWidth: 125,              // ✅ makes buttons consistent width
};

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        {/* Breadcrumbs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Link href="/" style={layout.badge}>
            Home
          </Link>
          <span style={layout.badge}>›</span>
          <Link href="/cities" style={layout.badge}>
            Cities
          </Link>
          <span style={layout.badge}>›</span>
          <Link href={`/city/${encodeURIComponent(office.city)}`} style={layout.badge}>
            {office.city}
          </Link>
          <span style={layout.badge}>›</span>
          <span style={layout.badge}>{office.name}</span>
        </div>

        {/* Title row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <h1 style={{ ...layout.h1, fontSize: 22 }}>{office.name}</h1>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={layout.badge}>{office.category}</span>
              <span style={layout.badge}>{office.city}</span>
              <span style={layout.badge}>{office.area}</span>
              <OpenNowBadge hours={office.hours} />
            </div>
          </div>

          <Link href={`/city/${encodeURIComponent(office.city)}`} style={layout.pill}>
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
          {/* ALL actions in ONE row (wraps nicely on small screens) */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <a href={maps} target="_blank" rel="noreferrer" style={actionBubble}>
              📍 Open in Maps
            </a>

            {office.address && (
              <CopyButton text={office.address} label="Copy address" style={actionBubble} />
            )}

            {office.phone && (
              <a href={`tel:${office.phone}`} style={actionBubble}>
                📞 Call
              </a>
            )}

            {office.phone && (
              <CopyButton text={office.phone} label="Copy phone" style={actionBubble} />
            )}

            <FavoriteButton id={office.id} bubbleStyle={actionBubble} />
            <ShareButton office={office} style={actionBubble} />
            <SuggestCorrectionButton office={office} style={actionBubble} />
          </div>
        </div>

        {/* Collapsible sections */}
        <div style={{ display: "grid", gap: 12 }}>
          <CollapsibleSection title="Overview" icon="ℹ️" defaultOpen>
            <div style={{ color: colors.muted, fontSize: 14, lineHeight: 1.6 }}>
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
                    style={{ color: colors.green }}
                  >
                    {office.website}
                  </a>
                ) : (
                  "Not added yet"
                )}
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Requirements" icon="🪪" defaultOpen>
            {(office.requirements || []).length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18, color: colors.muted, lineHeight: 1.7 }}>
                {(office.requirements || []).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              <div style={{ color: colors.muted }}>No specific requirements listed yet.</div>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Steps" icon="🪜" defaultOpen>
            {(office.steps || []).length > 0 ? (
              <ol style={{ margin: 0, paddingLeft: 18, color: colors.muted, lineHeight: 1.7 }}>
                {(office.steps || []).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ol>
            ) : (
              <div style={{ color: colors.muted }}>No steps listed yet.</div>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Fees" icon="💵" defaultOpen>
            {(office.fees || []).length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18, color: colors.muted, lineHeight: 1.7 }}>
                {(office.fees || []).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              <div style={{ color: colors.muted }}>No fees listed yet.</div>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Notes" icon="📝" defaultOpen>
            {(office.notes || []).length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18, color: colors.muted, lineHeight: 1.7 }}>
                {(office.notes || []).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              <div style={{ color: colors.muted }}>No notes listed yet.</div>
            )}

            <div style={{ marginTop: 10, fontSize: 12, color: colors.muted }}>
              Always verify requirements with the official office/website before visiting.
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Verify before you visit" icon="✅" defaultOpen>
            <div style={{ color: colors.muted, lineHeight: 1.6, fontSize: 14 }}>
              Requirements and timings can change. Always confirm with the official source or call
              the office.
            </div>

            <div style={{ height: 10 }} />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {office.website ? (
                <a href={office.website} target="_blank" rel="noreferrer" style={layout.pill}>
                  Official website
                </a>
              ) : (
                <span style={layout.pill}>Official website: not added yet</span>
              )}

              {office.phone ? (
                <a href={`tel:${office.phone}`} style={layout.pill}>
                  📞 Call: {office.phone}
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


