import OpenAI from "openai";
import { retrieveChunks } from "@/lib/rag/retrieve";
import { chatBodySchema } from "@/lib/validation/search";
import { withErrorHandling, badRequest } from "@/lib/http/errors";
import { enforceRateLimit } from "@/lib/rateLimit";
import { recordOpenAiCall } from "@/lib/metrics";
import { getOrSetCache, cacheKey } from "@/lib/cache/redis";
import { getOfficesByIds } from "@/lib/offices";
import { getEmbassiesByIds } from "@/lib/embassies";

const RETRIEVAL_CACHE_TTL_SECONDS = 30 * 60; // embedding a given query string is deterministic — safe to cache

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Chunk titles carry extra context for the LLM (e.g. "Guide — step name"), which
 * makes a poor citation label — so sources are re-fetched by id/slug to get
 * clean, correctly-shaped name/city fields for the UI (ChatBot.js) instead of
 * parsing them back out of chunk.title.
 */
async function buildSources(chunks) {
  const officeIds = [...new Set(chunks.filter((c) => c.sourceType === "office").map((c) => c.sourceId))];
  const embassyIds = [...new Set(chunks.filter((c) => c.sourceType === "embassy").map((c) => c.sourceId))];

  const [offices, embassies] = await Promise.all([
    getOfficesByIds(officeIds),
    getEmbassiesByIds(embassyIds),
  ]);
  const officeById = new Map(offices.map((o) => [o.id, o]));
  const embassyById = new Map(embassies.map((e) => [e.id, e]));

  const seen = new Set();
  const sources = [];
  for (const chunk of chunks) {
    const key = `${chunk.sourceType}:${chunk.sourceId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (chunk.sourceType === "guide") {
      sources.push({ type: "guide", slug: chunk.sourceId, title: chunk.title.split(" — ")[0] });
    } else if (chunk.sourceType === "embassy") {
      const e = embassyById.get(chunk.sourceId);
      if (e) sources.push({ type: "embassy", id: e.id, name: e.name, city: e.city });
    } else {
      const o = officeById.get(chunk.sourceId);
      if (o) sources.push({ type: "office", id: o.id, name: o.name, city: o.city });
    }
  }
  return sources;
}

function buildContext(chunks) {
  return chunks.map((c, i) => `[${i + 1}] ${c.title}\n${c.content}`).join("\n\n---\n\n");
}

export const POST = withErrorHandling(async (req) => {
  await enforceRateLimit("chat", req);

  const { messages } = chatBodySchema.parse(await req.json());

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMsg) throw badRequest("No user message found.");

  const query = lastUserMsg.content.trim();

  const start = Date.now();
  const chunks = await getOrSetCache(
    cacheKey("chat-retrieval", { query: query.toLowerCase() }),
    RETRIEVAL_CACHE_TTL_SECONDS,
    () => retrieveChunks(query, { limit: 6 })
  );
  await recordOpenAiCall({ operation: "embedding", latencyMs: Date.now() - start });

  const sources = await buildSources(chunks);
  const context = buildContext(chunks);
  const hasContext = chunks.length > 0;

  // Fallback without OpenAI (or if retrieval found nothing useful).
  if (!client) {
    const answer = hasContext
      ? "Here's what I found in our database. Check the links below for full details."
      : "I couldn't find specific information about that. Try the Search tab or browse the Guides section.";
    return Response.json({ answer, sources });
  }

  const systemPrompt = `You are a helpful assistant for Pakistan Office Guide — a website that helps people navigate Pakistani government offices and procedures.

Answer ONLY based on the numbered excerpts below, retrieved from our database via hybrid (keyword + semantic) search. Do not use general knowledge or make up fees, addresses, or steps.
Be concise and practical. Use bullet points for lists. When you use information from an excerpt, you may reference it by its number like [1].

${
  hasContext
    ? `RETRIEVED EXCERPTS:\n\n${context}`
    : "No matching data was retrieved for this query."
}

Rules:
- Only use information from the excerpts above
- Keep your answer under 300 words
- Don't mention guide slugs or office/embassy IDs in your text — they'll be shown as clickable source links separately
- If no data matches, say so honestly and suggest using the Search or Guides section`;

  const chatStart = Date.now();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      // Include recent conversation turns for context.
      ...messages.slice(-6),
    ],
    max_tokens: 500,
    temperature: 0.3,
  });
  await recordOpenAiCall({ operation: "chat", latencyMs: Date.now() - chatStart });

  const answer = response.choices[0].message.content;
  return Response.json({ answer, sources });
});
