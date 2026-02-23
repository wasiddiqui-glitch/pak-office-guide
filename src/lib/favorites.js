"use client";

const KEY = "pakOfficeGuide:favorites";

export function getFavorites() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function toggleFavorite(id) {
  const list = new Set(getFavorites());
  if (list.has(id)) list.delete(id);
  else list.add(id);
  const next = Array.from(list);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}