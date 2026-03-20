import guides from "@/data/guides.json";

export function getAllGuides() {
  return guides;
}

export function getGuideBySlug(slug) {
  return guides.find((g) => g.slug === slug) || null;
}

export function getGuidesByCategory(category) {
  return guides.filter((g) => g.category.toLowerCase() === category.toLowerCase());
}
