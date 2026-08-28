import OpenAI from "openai";
import { searchOffices } from "@/lib/search/officeSearch";
import { slugify } from "@/lib/slug";
import { OFFICE_CATEGORIES, CITIES } from "@/lib/constants";
import { aiSearchBodySchema } from "@/lib/validation/search";
import { withErrorHandling } from "@/lib/http/errors";
import { enforceRateLimit } from "@/lib/rateLimit";
import { getOrSetCache, cacheKey } from "@/lib/cache/redis";
import { recordSearch, recordOpenAiCall } from "@/lib/metrics";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const FILTER_CACHE_TTL_SECONDS = 60 * 60; // NL -> filters is deterministic-ish and expensive; cache it for an hour.

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function fallbackExtract(query) {
  const q = normalizeText(query);

  const city = CITIES.find((c) => q.includes(normalizeText(c))) || null;

  let category = null;
  if (q.includes("cnic") || q.includes("nicop") || q.includes("b-form") || q.includes("nadra")) {
    category = "NADRA";
  } else if (q.includes("passport")) {
    category = "Passport";
  } else if (q.includes("license") || q.includes("learner")) {
    category = "Driving License";
  } else if (q.includes("traffic") || q.includes("challan")) {
    category = "Traffic";
  } else if (
    q.includes("electricity") ||
    q.includes("bill") ||
    q.includes("gas") ||
    q.includes("water") ||
    q.includes("utility")
  ) {
    category = "Utilities";
  }

  return {
    city,
    category,
    area: null,
    keywords: query
      .split(/\s+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 8),
  };
}

function sanitizeFilters(filters) {
  return {
    city: typeof filters?.city === "string" ? filters.city : null,
    category: typeof filters?.category === "string" ? filters.category : null,
    area: typeof filters?.area === "string" ? filters.area : null,
    keywords: Array.isArray(filters?.keywords)
      ? filters.keywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 8)
      : [],
  };
}

async function extractFilters(query) {
  try {
    if (!client) throw new Error("No API key");

    const start = Date.now();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You extract structured search filters for a Pakistan public office finder.
Respond with a JSON object only — no extra text.

Rules:
- Do not invent offices.
- Extract only from the user's query.
- Known categories: ${OFFICE_CATEGORIES.join(", ")}
- CNIC, NICOP, B-form -> NADRA
- learner permit, driving test, driving licence, license renewal -> Driving License
- electricity, gas, water, bill, customer service, utility -> Utilities
- passport renewal/new passport -> Passport
- traffic challan/violation -> Traffic
- Keep keywords short and useful.
- If missing, return null for city/category/area and [] for keywords.

Return format: {"city": string|null, "category": string|null, "area": string|null, "keywords": string[]}
          `.trim(),
        },
        { role: "user", content: query },
      ],
    });
    await recordOpenAiCall({ operation: "filter_extraction", latencyMs: Date.now() - start });

    return sanitizeFilters(JSON.parse(response.choices[0].message.content));
  } catch (err) {
    console.error("Structured AI parse failed, using fallback:", err);
    return fallbackExtract(query);
  }
}

export const POST = withErrorHandling(async (req) => {
  await enforceRateLimit("aiSearch", req);

  const { query } = aiSearchBodySchema.parse(await req.json());

  const filters = await getOrSetCache(
    cacheKey("ai-search-filters", { query: query.toLowerCase() }),
    FILTER_CACHE_TTL_SECONDS,
    () => extractFilters(query)
  );

  const start = Date.now();
  const { results, pagination } = await searchOffices({
    q: filters.keywords.join(" ") || undefined,
    city: filters.city ? slugify(filters.city) : undefined,
    category: filters.category ? slugify(filters.category) : undefined,
    area: filters.area || undefined,
    page: 1,
    pageSize: 10,
  });
  await recordSearch({ zeroResults: pagination.total === 0, latencyMs: Date.now() - start });

  return Response.json({ query, filters, results, pagination });
});
