// Postgres-backed (via Prisma) — replaces the old src/data/offices.json reads.
// Shapes returned here intentionally mirror the original JSON records (flat
// string arrays for requirements/steps/fees/notes, city/category as plain
// strings) so page components didn't need to change beyond adding `await`.
import { cache } from "react";
import { prisma } from "@/lib/db";

function toDateString(date) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function shapeOffice(office) {
  return {
    id: office.id,
    city: office.city.name,
    category: office.category.name,
    name: office.name,
    area: office.area,
    address: office.address,
    googleMapsLink: office.googleMapsLink,
    hours: office.hours,
    website: office.website,
    phone: office.phone,
    lat: office.lat,
    lng: office.lng,
    lastUpdated: toDateString(office.lastUpdated),
    requirements: office.requirements.map((r) => r.text),
    steps: office.steps.map((s) => s.text),
    fees: office.fees.map((f) => f.text),
    notes: office.notes.map((n) => n.text),
  };
}

const childInclude = {
  city: true,
  category: true,
  requirements: { orderBy: { position: "asc" } },
  steps: { orderBy: { position: "asc" } },
  fees: { orderBy: { position: "asc" } },
  notes: { orderBy: { position: "asc" } },
};

export const getCities = cache(async function getCities() {
  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } });
  return cities.map((c) => c.name);
});

export const getCategories = cache(async function getCategories() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return categories.map((c) => c.name);
});

export const getOfficesByCity = cache(async function getOfficesByCity(city) {
  const offices = await prisma.office.findMany({
    where: { city: { name: { equals: city, mode: "insensitive" } } },
    include: childInclude,
    orderBy: { name: "asc" },
  });
  return offices.map(shapeOffice);
});

export const getOfficesByCategory = cache(async function getOfficesByCategory(category) {
  const offices = await prisma.office.findMany({
    where: { category: { name: { equals: category, mode: "insensitive" } } },
    include: childInclude,
    orderBy: { name: "asc" },
  });
  return offices.map(shapeOffice);
});

export const getOfficeById = cache(async function getOfficeById(id) {
  const office = await prisma.office.findUnique({
    where: { id },
    include: childInclude,
  });
  return office ? shapeOffice(office) : null;
});

/** @returns {Promise<Record<string, number>>} office count keyed by category name */
export const getOfficeCountsByCategory = cache(async function getOfficeCountsByCategory() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { offices: true } } },
  });
  return Object.fromEntries(categories.map((c) => [c.name, c._count.offices]));
});

export const getOfficesByIds = cache(async function getOfficesByIds(ids) {
  if (!ids?.length) return [];
  const offices = await prisma.office.findMany({
    where: { id: { in: ids } },
    include: childInclude,
  });
  return offices.map(shapeOffice);
});
