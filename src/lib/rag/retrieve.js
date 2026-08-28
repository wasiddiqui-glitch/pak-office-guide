// Hybrid retrieval for the RAG chatbot: combines pgvector cosine similarity
// (semantic) with Postgres full-text search (keyword) over the same
// DocumentChunk table, merged via Reciprocal Rank Fusion (RRF) — a simple,
// well-established way to combine two independently-ranked result lists
// without needing to normalize/calibrate their raw scores against each other.
//
// Uses $queryRawUnsafe with manual placeholders rather than Prisma.sql tagged
// templates — see the comment in src/lib/search/officeSearch.js for why.
import { prisma } from "@/lib/db";
import { embedQuery } from "@/lib/rag/embeddings";
import { reciprocalRankFusion } from "@/lib/rag/fusion";

const CANDIDATES_PER_METHOD = 20;

function toVectorLiteral(embedding) {
  return `[${embedding.join(",")}]`;
}

/** Vector similarity search over DocumentChunk. Returns rows ordered best-first. */
async function vectorSearch(embedding, limit) {
  const vectorLiteral = toVectorLiteral(embedding);
  return prisma.$queryRawUnsafe(
    `
      SELECT id, "sourceType", "sourceId", title, content,
             1 - (embedding <=> $1::vector) AS similarity
      FROM "DocumentChunk"
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `,
    vectorLiteral,
    limit
  );
}

/** Postgres full-text search over DocumentChunk. Returns rows ordered best-first. */
async function keywordSearch(query, limit) {
  return prisma.$queryRawUnsafe(
    `
      SELECT id, "sourceType", "sourceId", title, content,
             ts_rank_cd("searchVector", plainto_tsquery('english', $1), 32) AS rank
      FROM "DocumentChunk"
      WHERE "searchVector" @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT $2
    `,
    query,
    limit
  );
}

/**
 * Hybrid retrieval: embeds `query`, runs vector + keyword search in parallel,
 * fuses with RRF, and returns the top `limit` chunks with citation metadata.
 *
 * @param {string} query
 * @param {{ limit?: number, embedOpts?: object }} [options]
 */
export async function retrieveChunks(query, { limit = 6, embedOpts } = {}) {
  const [embedding, keywordResults] = await Promise.all([
    embedQuery(query, embedOpts).catch((err) => {
      console.warn("Embedding failed, falling back to keyword-only retrieval:", err.message);
      return null;
    }),
    keywordSearch(query, CANDIDATES_PER_METHOD),
  ]);

  const vectorResults = embedding ? await vectorSearch(embedding, CANDIDATES_PER_METHOD) : [];

  const fused = reciprocalRankFusion([vectorResults, keywordResults]);
  return fused.slice(0, limit);
}
