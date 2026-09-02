import Link from "next/link";
import { getAllGuides } from "@/lib/guides";
import { layout, colors, type, space } from "@/lib/ui";
import PageHeader from "@/components/PageHeader";

const categoryStyle = {
  NADRA: { bg: "rgba(26,107,181,0.12)", border: "rgba(26,107,181,0.28)", color: "#1a4f8a" },
  Passport: { bg: "rgba(101,60,168,0.12)", border: "rgba(101,60,168,0.28)", color: "#5a3a99" },
  "Driving License": { bg: "rgba(217,119,6,0.12)", border: "rgba(217,119,6,0.28)", color: "#92540a" },
  Land: { bg: "rgba(120,80,40,0.12)", border: "rgba(120,80,40,0.28)", color: "#6b4423" },
  Excise: { bg: "rgba(13,148,136,0.12)", border: "rgba(13,148,136,0.28)", color: "#0a6b62" },
  FBR: { bg: "rgba(30,58,138,0.12)", border: "rgba(30,58,138,0.28)", color: "#1e3a8a" },
  SECP: { bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.28)", color: "#6b3ab5" },
  Police: { bg: "rgba(71,85,105,0.12)", border: "rgba(71,85,105,0.28)", color: "#334155" },
  Overseas: { bg: "rgba(14,116,144,0.12)", border: "rgba(14,116,144,0.28)", color: "#0a6b82" },
};

function CategoryBadge({ category }) {
  const s = categoryStyle[category] || {};
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${s.border || colors.border}`,
        background: s.bg || "rgba(11,107,58,0.08)",
        color: s.color || colors.greenDark,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {category}
    </span>
  );
}

export const metadata = {
  title: "Guides",
  description:
    "Step-by-step guides for common government tasks in Pakistan — CNIC renewal, passport, driving license, property transfer, and more.",
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <PageHeader
          eyebrow="Learn"
          title="Guides"
          sub="Step-by-step walkthroughs for the most common government tasks in Pakistan."
        />

        <div style={{ display: "grid", gap: space.md }}>
          {guides.map((guide) => (
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
                <CategoryBadge category={guide.category} />
                {guide.city && <span style={layout.badge}>{guide.city}</span>}
                <span style={layout.badge}>{guide.estimatedTime}</span>
                <span style={layout.badge}>{guide.totalFees}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
