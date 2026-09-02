import Link from "next/link";
import { getGuideBySlug, getAllGuides } from "@/lib/guides";
import { getOfficesByCategory } from "@/lib/offices";
import { layout, colors, type, space } from "@/lib/ui";
import CollapsibleSection from "@/components/CollapsibleSection";
import Breadcrumbs from "@/components/Breadcrumbs";
import OfficeListItem from "@/components/OfficeListItem";
import StepList from "@/components/StepList";

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
            <h1 style={type.h1}>Guide not found</h1>
            <Link href="/guides" className="ui-badge" style={layout.pill}>
              ← All Guides
            </Link>
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
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }]} />

        {/* Header */}
        <div style={{ ...layout.card, marginBottom: space.md }}>
          <h1 style={{ ...type.h1, marginBottom: space.sm }}>{guide.title}</h1>
          <p style={{ ...type.body, margin: `0 0 ${space.md}px 0` }}>{guide.summary}</p>
          <div style={{ display: "flex", gap: space.xs, flexWrap: "wrap" }}>
            <span style={layout.badge}>{guide.category}</span>
            {guide.city && <span style={layout.badge}>{guide.city}</span>}
            <span style={layout.badge}>{guide.estimatedTime}</span>
            <span style={layout.badge}>{guide.totalFees}</span>
          </div>
        </div>

        <div style={{ display: "grid", gap: space.md }}>
          <CollapsibleSection title="What you need to bring" defaultOpen>
            <ul style={{ ...type.body, margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {guide.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </CollapsibleSection>

          <CollapsibleSection title="Step-by-step" defaultOpen>
            <StepList steps={guide.steps} />
          </CollapsibleSection>

          {guide.tips?.length > 0 && (
            <CollapsibleSection title="Tips" defaultOpen>
              <ul style={{ ...type.body, margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                {guide.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {guide.faqs?.length > 0 && (
            <CollapsibleSection title="Frequently asked questions" defaultOpen>
              <div style={{ display: "grid", gap: space.md }}>
                {guide.faqs.map((faq, i) => (
                  <div key={i}>
                    <div style={{ ...type.h3, color: colors.text, marginBottom: 4 }}>{faq.q}</div>
                    <div style={type.body}>{faq.a}</div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {relatedOffices.length > 0 && (
            <CollapsibleSection title="Find an office near you" defaultOpen>
              <div style={{ display: "grid", gap: space.sm }}>
                {relatedOffices.map((o) => (
                  <OfficeListItem key={o.id} office={o} hideCategory />
                ))}
              </div>
              {guide.relatedOfficeCategory && (
                <div style={{ marginTop: space.md }}>
                  <Link
                    href={`/category/${encodeURIComponent(guide.relatedOfficeCategory)}`}
                    className="ui-badge"
                    style={layout.pill}
                  >
                    View all {guide.relatedOfficeCategory} offices →
                  </Link>
                </div>
              )}
            </CollapsibleSection>
          )}

          <div style={type.small}>
            Last updated: {guide.lastUpdated}. Requirements and fees can change — always verify
            with the official office before visiting.
          </div>
        </div>
      </div>
    </main>
  );
}
