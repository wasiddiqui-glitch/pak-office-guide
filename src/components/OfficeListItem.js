import Link from "next/link";
import { layout, type, space } from "@/lib/ui";
import OpenNowBadge from "@/components/OpenNowBadge";

// Shared office-preview card used by city/category/favorites/guide-related
// lists — keeps the "name + badges" shape identical everywhere it appears.
export default function OfficeListItem({ office, hideCategory = false }) {
  return (
    <Link
      href={`/office/${office.id}`}
      className="ui-tile"
      style={{ ...layout.card, display: "block", textDecoration: "none" }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: space.sm, flexWrap: "wrap" }}
      >
        <div style={type.h3}>{office.name}</div>
        <OpenNowBadge hours={office.hours} />
      </div>
      <div style={{ display: "flex", gap: space.xs, flexWrap: "wrap", marginTop: space.sm }}>
        <span style={layout.badge}>{office.city}</span>
        {office.area && <span style={layout.badge}>{office.area}</span>}
        {!hideCategory && office.category && <span style={layout.badge}>{office.category}</span>}
      </div>
    </Link>
  );
}
