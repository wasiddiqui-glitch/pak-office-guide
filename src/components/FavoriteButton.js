"use client";

import { useEffect, useState } from "react";
import { layout } from "@/lib/ui";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

export default function FavoriteButton({ id, bubbleStyle }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(id));
  }, [id]);

  const onToggle = () => {
    toggleFavorite(id);
    setFav((v) => !v);
  };

  return (
    <button
      onClick={onToggle}
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