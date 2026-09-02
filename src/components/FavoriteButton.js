"use client";

import { useEffect, useState } from "react";
import { layout } from "@/lib/ui";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

export default function FavoriteButton({ id, bubbleStyle, className }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    // Reading localStorage must happen after mount (SSR has no `window`) —
    // setting state here, once, on mount is the standard hydration-safe pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFav(isFavorite(id));
  }, [id]);

  const onToggle = () => {
    toggleFavorite(id);
    setFav((v) => !v);
  };

  return (
    <button
      onClick={onToggle}
      className={className}
      style={{
        ...(bubbleStyle || { ...layout.btnBase, ...layout.btnGhost }),
        cursor: "pointer",
      }}
    >
      <span
        style={{
          color: fav ? "#16a34a" : "inherit",
          marginRight: 6,
        }}
      >
        {fav ? "★" : "☆"}
      </span>
      {fav ? "Saved" : "Save"}
    </button>
  );
}