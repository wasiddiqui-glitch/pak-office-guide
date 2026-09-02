import { getCities, getCategories } from "@/lib/offices";
import { prisma } from "@/lib/db";
import { getAllGuides } from "@/lib/guides";
import { getAllEmbassies } from "@/lib/embassies";

const BASE = "https://pk-office-guide.vercel.app";

export default async function sitemap() {
  const staticRoutes = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE}/guides`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/overseas`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE}/cities`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/categories`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/search`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/favorites`, priority: 0.5, changeFrequency: "never" },
  ];

  const [cities, categories, officeIds, guides, embassies] = await Promise.all([
    getCities(),
    getCategories(),
    prisma.office.findMany({ select: { id: true } }),
    getAllGuides(),
    getAllEmbassies(),
  ]);

  const cityRoutes = cities.map((city) => ({
    url: `${BASE}/city/${encodeURIComponent(city)}`,
    priority: 0.8,
    changeFrequency: "monthly",
  }));

  const categoryRoutes = categories.map((cat) => ({
    url: `${BASE}/category/${encodeURIComponent(cat)}`,
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  const officeRoutes = officeIds.map((o) => ({
    url: `${BASE}/office/${o.id}`,
    priority: 0.9,
    changeFrequency: "monthly",
  }));

  const guideRoutes = guides.map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    priority: 0.9,
    changeFrequency: "monthly",
  }));

  const embassyRoutes = embassies.map((e) => ({
    url: `${BASE}/overseas/embassy/${e.id}`,
    priority: 0.8,
    changeFrequency: "monthly",
  }));

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...categoryRoutes,
    ...officeRoutes,
    ...guideRoutes,
    ...embassyRoutes,
  ];
}
