import embassies from "@/data/embassies.json";

export function getAllEmbassies() {
  return embassies;
}

export function getEmbassyById(id) {
  return embassies.find((e) => e.id === id) || null;
}

export function getEmbassiesByRegion() {
  const map = {};
  for (const e of embassies) {
    if (!map[e.region]) map[e.region] = [];
    map[e.region].push(e);
  }
  return map;
}
