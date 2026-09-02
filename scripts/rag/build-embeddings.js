// Chunks every guide/office/embassy from Postgres, embeds each chunk with
// OpenAI, and stores them in DocumentChunk (pgvector column) for hybrid RAG
// retrieval. Safe to re-run: does a full delete+reinsert.
//
// Usage: node scripts/rag/build-embeddings.js
// Requires OPENAI_API_KEY (real embeddings cost money — this is a one-off
// indexing step, not something called per chat request).
//
// Note: fetches guides/offices/embassies via direct Prisma queries (not
// src/lib/{guides,offices,embassies}.js) because those use the "@/" path
// alias, which Next.js's bundler resolves but plain `node` cannot — this
// script runs standalone, outside the Next.js build. src/lib/rag/{chunk,embeddings}.js
// have no aliased imports, so they're dynamically imported directly below.
const crypto = require("crypto");
const { getPrismaClient } = require("../_lib/db");

const prisma = getPrismaClient();

function toDateString(date) {
  return date ? date.toISOString().slice(0, 10) : null;
}

async function loadGuides() {
  const guides = await prisma.guide.findMany({
    include: {
      category: true,
      requirements: { orderBy: { position: "asc" } },
      steps: { orderBy: { position: "asc" } },
      tips: { orderBy: { position: "asc" } },
      faqs: { orderBy: { position: "asc" } },
    },
  });
  return guides.map((g) => ({
    slug: g.slug,
    title: g.title,
    category: g.category?.name ?? null,
    city: g.city,
    summary: g.summary,
    estimatedTime: g.estimatedTime,
    totalFees: g.totalFees,
    lastUpdated: toDateString(g.lastUpdated),
    requirements: g.requirements.map((r) => r.text),
    steps: g.steps.map((s) => ({ title: s.title, body: s.body })),
    tips: g.tips.map((t) => t.text),
    faqs: g.faqs.map((f) => ({ q: f.q, a: f.a })),
  }));
}

async function loadOffices() {
  const offices = await prisma.office.findMany({
    include: {
      city: true,
      category: true,
      requirements: { orderBy: { position: "asc" } },
      steps: { orderBy: { position: "asc" } },
      fees: { orderBy: { position: "asc" } },
      notes: { orderBy: { position: "asc" } },
    },
  });
  return offices.map((o) => ({
    id: o.id,
    name: o.name,
    city: o.city.name,
    category: o.category.name,
    area: o.area,
    address: o.address,
    hours: o.hours,
    phone: o.phone,
    requirements: o.requirements.map((r) => r.text),
    steps: o.steps.map((s) => s.text),
    fees: o.fees.map((f) => f.text),
    notes: o.notes.map((n) => n.text),
  }));
}

async function loadEmbassies() {
  const embassies = await prisma.embassy.findMany({
    include: {
      services: { orderBy: { position: "asc" } },
      requirements: { orderBy: { position: "asc" } },
      steps: { orderBy: { position: "asc" } },
      fees: { orderBy: { position: "asc" } },
      notes: { orderBy: { position: "asc" } },
    },
  });
  return embassies.map((e) => ({
    id: e.id,
    name: e.name,
    city: e.city,
    country: e.country,
    region: e.region,
    address: e.address,
    hours: e.hours,
    phone: e.phone,
    services: e.services.map((s) => s.text),
    requirements: e.requirements.map((r) => r.text),
    steps: e.steps.map((s) => s.text),
    fees: e.fees.map((f) => f.text),
    notes: e.notes.map((n) => n.text),
  }));
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set — cannot build embeddings.");
    process.exitCode = 1;
    return;
  }

  const { chunkAll } = await import("../../src/lib/rag/chunk.js");
  const { embedTexts, EMBEDDING_MODEL } = await import("../../src/lib/rag/embeddings.js");

  console.log("Loading source content from Postgres...");
  const [guides, offices, embassies] = await Promise.all([
    loadGuides(),
    loadOffices(),
    loadEmbassies(),
  ]);

  const chunks = chunkAll({ guides, offices, embassies });
  console.log(
    `Chunked ${guides.length} guides, ${offices.length} offices, ${embassies.length} embassies -> ${chunks.length} chunks.`
  );

  console.log(`Embedding ${chunks.length} chunks with ${EMBEDDING_MODEL}...`);
  const embeddings = await embedTexts(chunks.map((c) => c.content));

  console.log("Replacing DocumentChunk table...");
  await prisma.documentChunk.deleteMany({});

  const now = new Date();
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddings[i];
    const vectorLiteral = `[${embedding.join(",")}]`;
    const approxTokens = Math.round(chunk.content.split(/\s+/).length * 1.3);

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO "DocumentChunk"
          (id, "sourceType", "sourceId", title, content, "chunkIndex", "tokenCount", embedding, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector, $9, $9)
      `,
      crypto.randomUUID(),
      chunk.sourceType,
      chunk.sourceId,
      chunk.title,
      chunk.content,
      chunk.chunkIndex,
      approxTokens,
      vectorLiteral,
      now
    );

    if ((i + 1) % 25 === 0 || i === chunks.length - 1) {
      console.log(`  ${i + 1}/${chunks.length} chunks stored`);
    }
  }

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
