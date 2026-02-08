import offices from "@/data/offices.json";

export function getCities() {
  return Array.from(new Set(offices.map((o) => o.city))).sort();
}

export function getCategories() {
  return Array.from(new Set(offices.map((o) => o.category))).sort();
}

export function getOfficesByCity(city) {
  return offices.filter((o) => o.city.toLowerCase() === city.toLowerCase());
}

export function getOfficeById(id) {
  return offices.find((o) => o.id === id);
}

export function searchOffices(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return offices.filter((o) => {
    const hay = `${o.city} ${o.category} ${o.name} ${o.area}`.toLowerCase();
    return hay.includes(q);
  });
}
