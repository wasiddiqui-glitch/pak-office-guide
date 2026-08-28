// Postgres-backed (via Prisma) — replaces the old src/data/guides.json reads.
import { cache } from "react";
import { prisma } from "@/lib/db";

function toDateString(date) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function shapeGuide(guide) {
  return {
    slug: guide.slug,
    title: guide.title,
    emoji: guide.emoji,
    summary: guide.summary,
    category: guide.category?.name ?? null,
    city: guide.city,
    estimatedTime: guide.estimatedTime,
    totalFees: guide.totalFees,
    lastUpdated: toDateString(guide.lastUpdated),
    relatedOfficeCategory: guide.relatedOfficeCategory,
    requirements: guide.requirements.map((r) => r.text),
    steps: guide.steps.map((s) => ({ title: s.title, body: s.body })),
    tips: guide.tips.map((t) => t.text),
    faqs: guide.faqs.map((f) => ({ q: f.q, a: f.a })),
  };
}

const childInclude = {
  category: true,
  requirements: { orderBy: { position: "asc" } },
  steps: { orderBy: { position: "asc" } },
  tips: { orderBy: { position: "asc" } },
  faqs: { orderBy: { position: "asc" } },
};

export const getAllGuides = cache(async function getAllGuides() {
  const guides = await prisma.guide.findMany({
    include: childInclude,
    orderBy: { title: "asc" },
  });
  return guides.map(shapeGuide);
});

export const getGuideBySlug = cache(async function getGuideBySlug(slug) {
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: childInclude,
  });
  return guide ? shapeGuide(guide) : null;
});

export const getGuidesByCategory = cache(async function getGuidesByCategory(category) {
  const guides = await prisma.guide.findMany({
    where: { category: { name: { equals: category, mode: "insensitive" } } },
    include: childInclude,
    orderBy: { title: "asc" },
  });
  return guides.map(shapeGuide);
});
