import Link from "next/link";
import { layout, space } from "@/lib/ui";

// Renders the ancestor trail only (Home / Cities / Karachi) — the current
// page's own name belongs in the h1 right below, not repeated as a crumb.
export default function Breadcrumbs({ items }) {
  return (
    <div
      style={{
        display: "flex",
        gap: space.xs,
        flexWrap: "wrap",
        marginBottom: space.md,
        alignItems: "center",
      }}
    >
      {items.map((item, i) => (
        <span key={item.href} style={{ display: "flex", alignItems: "center", gap: space.xs }}>
          <Link href={item.href} className="ui-badge" style={layout.badge}>
            {item.label}
          </Link>
          {i < items.length - 1 && <span style={{ opacity: 0.35, fontSize: 13 }}>/</span>}
        </span>
      ))}
    </div>
  );
}
