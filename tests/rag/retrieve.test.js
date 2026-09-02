// Tests hybrid retrieval end-to-end against real Postgres/pgvector, but with
// a deterministic mock embedding function (see src/lib/rag/embeddings.js) for
// both the fixture chunks and the query — so this never calls OpenAI, yet
// still exercises the real vector + full-text SQL and RRF fusion.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { retrieveChunks } from "@/lib/rag/retrieve";
import { mockEmbed } from "@/lib/rag/embeddings";

const FIXTURE_SOURCE_ID = "test-fixture-source";

const FIXTURES = [
  {
    sourceType: "guide",
    sourceId: FIXTURE_SOURCE_ID,
    title: "Test Guide — NADRA CNIC renewal",
    content: "nadra cnic renewal fixture chunk about identity cards",
    chunkIndex: 0,
  },
  {
    sourceType: "guide",
    sourceId: FIXTURE_SOURCE_ID,
    title: "Test Guide — Passport application",
    content: "passport application fixture chunk about travel documents",
    chunkIndex: 1,
  },
  {
    sourceType: "office",
    sourceId: FIXTURE_SOURCE_ID,
    title: "Test Office — unrelated topic",
    content: "zzz completely unrelated fixture content about gardening",
    chunkIndex: 0,
  },
];

beforeAll(async () => {
  await prisma.documentChunk.deleteMany({ where: { sourceId: FIXTURE_SOURCE_ID } });
  for (const fixture of FIXTURES) {
    const embedding = mockEmbed(fixture.content);
    const vectorLiteral = `[${embedding.join(",")}]`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "DocumentChunk" (id, "sourceType", "sourceId", title, content, "chunkIndex", embedding, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7::vector, now(), now())`,
      crypto.randomUUID(),
      fixture.sourceType,
      fixture.sourceId,
      fixture.title,
      fixture.content,
      fixture.chunkIndex,
      vectorLiteral
    );
  }
});

afterAll(async () => {
  await prisma.documentChunk.deleteMany({ where: { sourceId: FIXTURE_SOURCE_ID } });
  await prisma.$disconnect();
});

describe("retrieveChunks (hybrid, mock embeddings)", () => {
  it("ranks the semantically/keyword-relevant fixture chunk above the unrelated one", async () => {
    const results = await retrieveChunks("nadra cnic renewal", {
      limit: 10,
      embedOpts: { embedFn: mockEmbed },
    });

    const fixtureResults = results.filter((r) => r.sourceId === FIXTURE_SOURCE_ID);
    expect(fixtureResults.length).toBeGreaterThan(0);
    expect(fixtureResults[0].title).toContain("NADRA CNIC renewal");
  });

  it("returns chunks with citation-shaped fields (sourceType/sourceId/title/content)", async () => {
    const results = await retrieveChunks("passport travel documents", {
      limit: 5,
      embedOpts: { embedFn: mockEmbed },
    });
    for (const r of results) {
      expect(r).toHaveProperty("sourceType");
      expect(r).toHaveProperty("sourceId");
      expect(r).toHaveProperty("title");
      expect(r).toHaveProperty("content");
    }
  });
});
