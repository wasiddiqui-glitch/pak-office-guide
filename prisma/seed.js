// Seeds Postgres from the legacy JSON fixtures (src/data/*.json).
// Idempotent — safe to re-run: upserts by the original JSON ids/slugs, and
// replaces each row's child collections (requirements/steps/fees/...) wholesale.
//
// Usage: npx prisma db seed   (wired via prisma.config.ts -> migrations.seed)
//    or: node prisma/seed.js

const { getPrismaClient } = require("../scripts/_lib/db");

const offices = require("../src/data/offices.json");
const guides = require("../src/data/guides.json");
const embassies = require("../src/data/embassies.json");

const prisma = getPrismaClient();

const CATEGORY_ICONS = {
  NADRA: "🪪",
  Passport: "🛂",
  "Driving License": "🚗",
  Traffic: "🚦",
  Utilities: "💡",
  Police: "👮",
  Excise: "🚘",
  Land: "🏛️",
  Courts: "⚖️",
  "Post Office": "📮",
  FBR: "🧾",
  SECP: "🏢",
  Overseas: "🌍",
};

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function upsertLookups() {
  const cityNames = [...new Set(offices.map((o) => o.city).filter(Boolean))];
  const categoryNames = [
    ...new Set(
      [
        ...offices.map((o) => o.category),
        ...guides.map((g) => g.category),
        ...guides.map((g) => g.relatedOfficeCategory),
      ].filter(Boolean)
    ),
  ];

  const cityBySlug = new Map();
  for (const name of cityNames) {
    const slug = slugify(name);
    const city = await prisma.city.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    cityBySlug.set(name, city);
  }

  const categoryBySlug = new Map();
  for (const name of categoryNames) {
    const slug = slugify(name);
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name, icon: CATEGORY_ICONS[name] ?? null },
      create: { name, slug, icon: CATEGORY_ICONS[name] ?? null },
    });
    categoryBySlug.set(name, category);
  }

  return { cityByName: cityBySlug, categoryByName: categoryBySlug };
}

async function replaceChildren(model, fkField, parentId, rows) {
  // Dynamic model dispatch by name — Prisma's generated types can't express
  // this statically, hence the ts-ignore (this file is a one-off seed script,
  // not app code the rest of the codebase depends on).
  // @ts-ignore
  await prisma[model].deleteMany({ where: { [fkField]: parentId } });
  if (rows.length === 0) return;
  // @ts-ignore
  await prisma[model].createMany({ data: rows });
}

async function seedOffices({ cityByName, categoryByName }) {
  for (const o of offices) {
    const city = cityByName.get(o.city);
    const category = categoryByName.get(o.category);
    if (!city || !category) {
      console.warn(`Skipping office ${o.id} — unknown city/category`);
      continue;
    }

    await prisma.office.upsert({
      where: { id: o.id },
      update: {
        cityId: city.id,
        categoryId: category.id,
        name: o.name,
        area: o.area || null,
        address: o.address || null,
        googleMapsLink: o.googleMapsLink || null,
        hours: o.hours || null,
        website: o.website || null,
        phone: o.phone || null,
        lat: typeof o.lat === "number" ? o.lat : null,
        lng: typeof o.lng === "number" ? o.lng : null,
        lastUpdated: toDate(o.lastUpdated),
      },
      create: {
        id: o.id,
        cityId: city.id,
        categoryId: category.id,
        name: o.name,
        area: o.area || null,
        address: o.address || null,
        googleMapsLink: o.googleMapsLink || null,
        hours: o.hours || null,
        website: o.website || null,
        phone: o.phone || null,
        lat: typeof o.lat === "number" ? o.lat : null,
        lng: typeof o.lng === "number" ? o.lng : null,
        lastUpdated: toDate(o.lastUpdated),
      },
    });

    await replaceChildren(
      "officeRequirement",
      "officeId",
      o.id,
      (o.requirements || []).map((text, position) => ({ officeId: o.id, text, position }))
    );
    await replaceChildren(
      "officeStep",
      "officeId",
      o.id,
      (o.steps || []).map((text, position) => ({ officeId: o.id, text, position }))
    );
    await replaceChildren(
      "officeFee",
      "officeId",
      o.id,
      (o.fees || []).map((text, position) => ({ officeId: o.id, text, position }))
    );
    await replaceChildren(
      "officeNote",
      "officeId",
      o.id,
      (o.notes || []).map((text, position) => ({ officeId: o.id, text, position }))
    );
  }
  console.log(`Seeded ${offices.length} offices.`);
}

async function seedGuides({ categoryByName }) {
  for (const g of guides) {
    const category = categoryByName.get(g.category);

    const guide = await prisma.guide.upsert({
      where: { slug: g.slug },
      update: {
        title: g.title,
        emoji: g.emoji || null,
        summary: g.summary || null,
        categoryId: category ? category.id : null,
        city: g.city || null,
        estimatedTime: g.estimatedTime || null,
        totalFees: g.totalFees || null,
        relatedOfficeCategory: g.relatedOfficeCategory || null,
        lastUpdated: toDate(g.lastUpdated),
      },
      create: {
        slug: g.slug,
        title: g.title,
        emoji: g.emoji || null,
        summary: g.summary || null,
        categoryId: category ? category.id : null,
        city: g.city || null,
        estimatedTime: g.estimatedTime || null,
        totalFees: g.totalFees || null,
        relatedOfficeCategory: g.relatedOfficeCategory || null,
        lastUpdated: toDate(g.lastUpdated),
      },
    });

    await replaceChildren(
      "guideRequirement",
      "guideId",
      guide.id,
      (g.requirements || []).map((text, position) => ({ guideId: guide.id, text, position }))
    );
    await replaceChildren(
      "guideStep",
      "guideId",
      guide.id,
      (g.steps || []).map((s, position) => ({
        guideId: guide.id,
        title: s.title,
        body: s.body,
        position,
      }))
    );
    await replaceChildren(
      "guideTip",
      "guideId",
      guide.id,
      (g.tips || []).map((text, position) => ({ guideId: guide.id, text, position }))
    );
    await replaceChildren(
      "guideFaq",
      "guideId",
      guide.id,
      (g.faqs || []).map((f, position) => ({
        guideId: guide.id,
        q: f.q,
        a: f.a,
        position,
      }))
    );
  }
  console.log(`Seeded ${guides.length} guides.`);
}

async function seedEmbassies() {
  for (const e of embassies) {
    await prisma.embassy.upsert({
      where: { id: e.id },
      update: {
        name: e.name,
        city: e.city,
        country: e.country,
        region: e.region,
        address: e.address || null,
        phone: e.phone || null,
        website: e.website || null,
        hours: e.hours || null,
        nadraDesk: !!e.nadraDesk,
        passportServices: !!e.passportServices,
        nicopServices: !!e.nicopServices,
        lastUpdated: toDate(e.lastUpdated),
      },
      create: {
        id: e.id,
        name: e.name,
        city: e.city,
        country: e.country,
        region: e.region,
        address: e.address || null,
        phone: e.phone || null,
        website: e.website || null,
        hours: e.hours || null,
        nadraDesk: !!e.nadraDesk,
        passportServices: !!e.passportServices,
        nicopServices: !!e.nicopServices,
        lastUpdated: toDate(e.lastUpdated),
      },
    });

    await replaceChildren(
      "embassyService",
      "embassyId",
      e.id,
      (e.services || []).map((text, position) => ({ embassyId: e.id, text, position }))
    );
    await replaceChildren(
      "embassyRequirement",
      "embassyId",
      e.id,
      (e.requirements || []).map((text, position) => ({ embassyId: e.id, text, position }))
    );
    await replaceChildren(
      "embassyStep",
      "embassyId",
      e.id,
      (e.steps || []).map((text, position) => ({ embassyId: e.id, text, position }))
    );
    await replaceChildren(
      "embassyFee",
      "embassyId",
      e.id,
      (e.fees || []).map((text, position) => ({ embassyId: e.id, text, position }))
    );
    await replaceChildren(
      "embassyNote",
      "embassyId",
      e.id,
      (e.notes || []).map((text, position) => ({ embassyId: e.id, text, position }))
    );
  }
  console.log(`Seeded ${embassies.length} embassies.`);
}

async function main() {
  console.log("Seeding Postgres from src/data/*.json ...");
  const lookups = await upsertLookups();
  await seedOffices(lookups);
  await seedGuides(lookups);
  await seedEmbassies();
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
