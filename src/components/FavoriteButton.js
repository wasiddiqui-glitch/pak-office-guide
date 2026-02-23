"use client";

import { useEffect, useState } from "react";
import { layout } from "@/lib/ui";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

export default function FavoriteButton({ id }) {
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
        ...layout.btnBase,
        ...layout.btnGhost,
      }}
    >
      {fav ? "⭐ Saved" : "☆ Save"}
    </button>
  );
}