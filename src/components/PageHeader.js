import Link from "next/link";
import { layout, type, space } from "@/lib/ui";

// Shared "eyebrow + title + sub + optional back-link + optional badge row"
// header used by every list/detail page below the home page.
export default function PageHeader({ eyebrow, icon, title, sub, action, badges }) {
  return (
    <div style={{ marginBottom: space.xl }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: space.md,
          alignItems: "flex-start",
        }}
      >
        <div>
          {eyebrow && <p style={type.eyebrow}>{eyebrow}</p>}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: space.sm,
              marginTop: eyebrow ? 4 : 0,
            }}
          >
            {icon && (
              <span style={{ fontSize: 26, lineHeight: 1 }} aria-hidden>
                {icon}
              </span>
            )}
            <h1 style={type.h1}>{title}</h1>
          </div>
          {sub && <p style={{ ...type.body, marginTop: space.xs, maxWidth: 560 }}>{sub}</p>}
        </div>

        {action && (
          <Link href={action.href} className="ui-badge" style={layout.pill}>
            {action.label}
          </Link>
        )}
      </div>

      {badges && badges.length > 0 && (
        <div style={{ display: "flex", gap: space.xs, flexWrap: "wrap", marginTop: space.md }}>
          {badges}
        </div>
      )}
    </div>
  );
}
