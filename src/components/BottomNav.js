"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home" },
    { href: "/cities", label: "Cities" },
    { href: "/search", label: "Search" },
    { href: "/favorites", label: "Favorites" }, // ✅ new
  ];

  return (
    <nav style={navWrap}>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              ...navItem,
              ...(active ? navItemActive : {}),
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

const navWrap = {
  position: "fixed",
  left: "50%",
  transform: "translateX(-50%)",
  bottom: 14,
  width: "min(900px, calc(100% - 28px))",
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)", // ✅ was 3, now 4
  gap: 8,
  padding: 8,
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(18,26,42,0.92)",
  backdropFilter: "blur(10px)",
  zIndex: 999,
};

const navItem = {
  textAlign: "center",
  padding: "12px 8px",
  borderRadius: 16,
  color: "#a9b3c7",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.02)",
  fontWeight: 800,
  textDecoration: "none",
};

const navItemActive = {
  background: "rgba(93,214,255,0.14)",
  border: "1px solid rgba(93,214,255,0.20)",
  color: "#e7ecf5",
};
  
  
