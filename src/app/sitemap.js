import offices from "@/data/offices.json";

const BASE = "https://pk-office-guide.vercel.app";

export default function sitemap() {
  const staticRoutes = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE}/cities`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/categories`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/search`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/favorites`, priority: 0.5, changeFrequency: "never" },
  ];

  const cities = [...new Set(offices.map((o) => o.city).filter(Boolean))];
  const cityRoutes = cities.map((city) => ({
    url: `${BASE}/city/${encodeURIComponent(city)}`,
    priority: 0.8,
    changeFrequency: "monthly",
  }));

  const categories = [...new Set(offices.map((o) => o.category).filter(Boolean))];
  const categoryRoutes = categories.map((cat) => ({
    url: `${BASE}/category/${encodeURIComponent(cat)}`,
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  const officeRoutes = offices.map((o) => ({
    url: `${BASE}/office/${o.id}`,
    priority: 0.9,
    changeFrequency: "monthly",
  }));

  return [...staticRoutes, ...cityRoutes, ...categoryRoutes, ...officeRoutes];
}
