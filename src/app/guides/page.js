import Link from "next/link";
import { getAllGuides } from "@/lib/guides";
import { layout, colors } from "@/lib/ui";

export const metadata = {
  title: "Guides",
  description: "Step-by-step guides for common government tasks in Pakistan — CNIC renewal, passport, driving license, property transfer, and more.",
};

export default function GuidesPage() {
  const guides = getAllGuides();

  return (
    <main className="page-transition" style={layout.page}>
      <div style={layout.container}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ ...layout.h1, marginBottom: 6 }}>Guides</h1>
          <p style={{ ...layout.sub, margin: 0 }}>
            Step-by-step walkthroughs for the most common government tasks in Pakistan.
          </p>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              style={{ ...layout.card, display: "block", textDecoration: "none" }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{guide.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 16, color: colors.text, marginBottom: 4 }}>
                    {guide.title}
                  </div>
                  <div style={{ color: colors.muted, fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>
                    {guide.summary}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={layout.badge}>{guide.category}</span>
                    {guide.city && <span style={layout.badge}>{guide.city}</span>}
                    <span style={layout.badge}>⏱ {guide.estimatedTime}</span>
                    <span style={layout.badge}>💰 {guide.totalFees}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
