// Postgres-backed (via Prisma) — replaces the old src/data/embassies.json reads.
import { cache } from "react";
import { prisma } from "@/lib/db";

function toDateString(date) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function shapeEmbassy(embassy) {
  return {
    id: embassy.id,
    name: embassy.name,
    city: embassy.city,
    country: embassy.country,
    region: embassy.region,
    address: embassy.address,
    phone: embassy.phone,
    website: embassy.website,
    hours: embassy.hours,
    nadraDesk: embassy.nadraDesk,
    passportServices: embassy.passportServices,
    nicopServices: embassy.nicopServices,
    lastUpdated: toDateString(embassy.lastUpdated),
    services: embassy.services.map((s) => s.text),
    requirements: embassy.requirements.map((r) => r.text),
    steps: embassy.steps.map((s) => s.text),
    fees: embassy.fees.map((f) => f.text),
    notes: embassy.notes.map((n) => n.text),
  };
}

const childInclude = {
  services: { orderBy: { position: "asc" } },
  requirements: { orderBy: { position: "asc" } },
  steps: { orderBy: { position: "asc" } },
  fees: { orderBy: { position: "asc" } },
  notes: { orderBy: { position: "asc" } },
};

export const getAllEmbassies = cache(async function getAllEmbassies() {
  const embassies = await prisma.embassy.findMany({
    include: childInclude,
    orderBy: { name: "asc" },
  });
  return embassies.map(shapeEmbassy);
});

export const getEmbassyById = cache(async function getEmbassyById(id) {
  const embassy = await prisma.embassy.findUnique({
    where: { id },
    include: childInclude,
  });
  return embassy ? shapeEmbassy(embassy) : null;
});

export const getEmbassiesByIds = cache(async function getEmbassiesByIds(ids) {
  if (!ids?.length) return [];
  const embassies = await prisma.embassy.findMany({
    where: { id: { in: ids } },
    include: childInclude,
  });
  return embassies.map(shapeEmbassy);
});

export const getEmbassiesByRegion = cache(async function getEmbassiesByRegion() {
  const embassies = await getAllEmbassies();
  const map = {};
  for (const e of embassies) {
    if (!map[e.region]) map[e.region] = [];
    map[e.region].push(e);
  }
  return map;
});
