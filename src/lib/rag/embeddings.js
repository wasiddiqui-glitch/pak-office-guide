// Embedding generation — OpenAI text-embedding-3-small (1536 dims, matches the
// pgvector column in prisma/schema.prisma). The embed function is injectable so
// tests can swap in a deterministic mock instead of calling OpenAI.
import OpenAI from "openai";

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;
const BATCH_SIZE = 100; // OpenAI allows up to 2048 inputs/call; keep batches small & safe

let client = null;
function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

async function embedBatchOpenAI(texts) {
  const c = getClient();
  if (!c) throw new Error("OPENAI_API_KEY is not set — cannot generate embeddings.");
  const response = await c.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

/**
 * Deterministic pseudo-embedding for tests/CI — hashes text into a unit vector
 * so retrieval/fusion logic can be tested without calling OpenAI. NOT semantically
 * meaningful; only useful for exercising the plumbing (shapes, ranking, fusion).
 */
export function mockEmbed(text) {
  const vec = new Array(EMBEDDING_DIMENSIONS).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[text.charCodeAt(i) % EMBEDDING_DIMENSIONS] += 1;
  }
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

/**
 * Embeds an array of texts, in batches. Pass `{ embedFn }` to override the
 * per-batch embedder (e.g. tests injecting mockEmbed).
 * @param {string[]} texts
 * @param {{ embedFn?: (text: string) => number[] }} [options]
 */
export async function embedTexts(texts, { embedFn } = {}) {
  if (embedFn) return texts.map(embedFn);

  const results = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const embeddings = await embedBatchOpenAI(batch);
    results.push(...embeddings);
  }
  return results;
}

export async function embedQuery(text, opts = {}) {
  const [embedding] = await embedTexts([text], opts);
  return embedding;
}
