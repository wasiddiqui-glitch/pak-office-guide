import Link from "next/link";
import { getGuideBySlug, getAllGuides } from "@/lib/guides";
import { getOfficesByCategory } from "@/lib/offices";
import { layout, colors } from "@/lib/ui";
import CollapsibleSection from "@/components/CollapsibleSection";

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Guide not found" };
  return {
    title: guide.title,
    description: guide.summary,
    openGraph: { title: guide.title, description: guide.summary },
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    return (
      <main style={layout.page}>
        <div style={layout.container}>
          <div style={layout.card}>
            <h1 style={layout.h1}>Guide not found</h1>
            <Link href="/guides" style={layout.pill}>← All Guides</Link>
          </div>
        </div>
      </main>
    );
  }

  const relatedOffices = guide.relatedOfficeCategory
    ? (await getOfficesByCategory(guide.relatedOfficeCategory))
        .filter((o) => !guide.city || o.city === guide.city)
        .slice(0, 6)
    : [];

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>

        {/* Breadcrumbs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <Link href="/" style={layout.badge}>Home</Link>
          <span style={layout.badge}>›</span>
          <Link href="/guides" style={layout.badge}>Guides</Link>
          <span style={layout.badge}>›</span>
          <span style={layout.badge}>{guide.title}</span>
        </div>

        {/* Header */}
        <div style={{ ...layout.card, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ fontSize: 40, lineHeight: 1, flexShrink: 0 }}>{guide.emoji}</span>
            <div>
              <h1 style={{ ...layout.h1, fontSize: 22, marginBottom: 8 }}>{guide.title}</h1>
              <p style={{ color: colors.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px 0" }}>
                {guide.summary}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={layout.badge}>{guide.category}</span>
                {guide.city && <span style={layout.badge}>{guide.city}</span>}
                <span style={layout.badge}>⏱ {guide.estimatedTime}</span>
                <span style={layout.badge}>💰 {guide.totalFees}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>

          {/* Requirements */}
          <CollapsibleSection title="What you need to bring" icon="🪪" defaultOpen>
            <ul style={{ margin: 0, paddingLeft: 20, color: colors.muted, lineHeight: 1.8 }}>
              {guide.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </CollapsibleSection>

          {/* Steps */}
          <CollapsibleSection title="Step-by-step" icon="🪜" defaultOpen>
            <div style={{ display: "grid", gap: 16 }}>
              {guide.steps.map((step, i) => (
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
                  <div>
                    <div style={{ fontWeight: 900, color: colors.text, marginBottom: 4 }}>
                      {step.title}
                    </div>
                    <div style={{ color: colors.muted, fontSize: 14, lineHeight: 1.6 }}>
                      {step.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Tips */}
          {guide.tips?.length > 0 && (
            <CollapsibleSection title="Tips" icon="💡" defaultOpen>
              <ul style={{ margin: 0, paddingLeft: 20, color: colors.muted, lineHeight: 1.8 }}>
                {guide.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* FAQs */}
          {guide.faqs?.length > 0 && (
            <CollapsibleSection title="Frequently asked questions" icon="❓" defaultOpen>
              <div style={{ display: "grid", gap: 14 }}>
                {guide.faqs.map((faq, i) => (
                  <div key={i}>
                    <div style={{ fontWeight: 900, color: colors.text, marginBottom: 4 }}>
                      {faq.q}
                    </div>
                    <div style={{ color: colors.muted, fontSize: 14, lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Related offices */}
          {relatedOffices.length > 0 && (
            <CollapsibleSection title="Find an office near you" icon="📍" defaultOpen>
              <div style={{ display: "grid", gap: 10 }}>
                {relatedOffices.map((o) => (
                  <Link
                    key={o.id}
                    href={`/office/${o.id}`}
                    style={{ ...layout.card, display: "block", textDecoration: "none", padding: 12 }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 14 }}>{o.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      <span style={layout.badge}>{o.city}</span>
                      <span style={layout.badge}>{o.area}</span>
                    </div>
                  </Link>
                ))}
              </div>
              {guide.relatedOfficeCategory && (
                <div style={{ marginTop: 12 }}>
                  <Link
                    href={`/category/${encodeURIComponent(guide.relatedOfficeCategory)}`}
                    style={layout.pill}
                  >
                    View all {guide.relatedOfficeCategory} offices →
                  </Link>
                </div>
              )}
            </CollapsibleSection>
          )}

          {/* Disclaimer */}
          <div style={{ color: colors.muted, fontSize: 12, lineHeight: 1.6 }}>
            Last updated: {guide.lastUpdated}. Requirements and fees can change — always verify with the official office before visiting.
          </div>
        </div>
      </div>
    </main>
  );
}
