import OpenAI from "openai";
import offices from "@/data/offices.json";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const KNOWN_CATEGORIES = [
  "NADRA",
  "Passport",
  "Driving License",
  "Utilities",
  "Police",
  "Excise",
  "Land",
  "Courts",
  "Post Office",
];

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function scoreOffice(office, filters) {
  let score = 0;

  const city = normalizeText(office.city);
  const area = normalizeText(office.area);
  const category = normalizeText(office.category);
  const name = normalizeText(office.name);
  const address = normalizeText(office.address);
  const notes = Array.isArray(office.notes)
    ? office.notes.map(normalizeText).join(" ")
    : normalizeText(office.notes);
  const requirements = Array.isArray(office.requirements)
    ? office.requirements.map(normalizeText).join(" ")
    : "";
  const steps = Array.isArray(office.steps)
    ? office.steps.map(normalizeText).join(" ")
    : "";

  if (filters.city && city === normalizeText(filters.city)) score += 5;
  if (filters.category && category === normalizeText(filters.category)) score += 5;
  if (filters.area && area.includes(normalizeText(filters.area))) score += 3;

  for (const keyword of filters.keywords || []) {
    const k = normalizeText(keyword);
    if (!k) continue;

    if (name.includes(k)) score += 2;
    if (address.includes(k)) score += 1;
    if (notes.includes(k)) score += 1;
    if (requirements.includes(k)) score += 1;
    if (steps.includes(k)) score += 1;
    if (category.includes(k)) score += 1;
    if (city.includes(k)) score += 1;
    if (area.includes(k)) score += 1;
  }

  return score;
}

function fallbackExtract(query) {
  const q = normalizeText(query);

  const cities = [...new Set(offices.map((o) => o.city).filter(Boolean))];
  const city = cities.find((c) => q.includes(normalizeText(c))) || null;

  let category = null;

  if (q.includes("cnic") || q.includes("nicop") || q.includes("b-form") || q.includes("nadra")) {
    category = "NADRA";
  } else if (q.includes("passport")) {
    category = "Passport";
  } else if (q.includes("license") || q.includes("learner")) {
    category = "Driving License";
  } else if (
    q.includes("electricity") ||
    q.includes("bill") ||
    q.includes("gas") ||
    q.includes("water") ||
    q.includes("utility")
  ) {
    category = "Utilities";
  } else if (q.includes("police")) {
    category = "Police";
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
      ? filters.keywords
          .map((k) => String(k).trim())
          .filter(Boolean)
          .slice(0, 8)
      : [],
  };
}

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query || !query.trim()) {
      return Response.json({ error: "Query is required." }, { status: 400 });
    }

    if (query.length > 200) {
      return Response.json({ error: "Query is too long." }, { status: 400 });
    }

    let filters;

    try {
      const response = await client.responses.create({
        model: "gpt-5-mini",
        text: {
          format: {
            type: "json_schema",
            name: "search_filters",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                city: {
                  type: ["string", "null"],
                },
                category: {
                  type: ["string", "null"],
                },
                area: {
                  type: ["string", "null"],
                },
                keywords: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["city", "category", "area", "keywords"],
            },
            strict: true,
          },
        },
        input: [
          {
            role: "system",
            content: `
You extract structured search filters for a Pakistan public office finder.

Rules:
- Do not invent offices.
- Extract only from the user's query.
- Known categories: ${KNOWN_CATEGORIES.join(", ")}
- CNIC, NICOP, B-form -> NADRA
- learner permit, driving test, driving licence, license renewal -> Driving License
- electricity, gas, water, bill, customer service, utility -> Utilities
- passport renewal/new passport -> Passport
- police verification -> Police
- Keep keywords short and useful.
- If missing, return null for city/category/area and [] for keywords.
            `.trim(),
          },
          {
            role: "user",
            content: query,
          },
        ],
      });

      const raw = response.output_text;
      filters = sanitizeFilters(JSON.parse(raw));
    } catch (err) {
      console.error("Structured AI parse failed, using fallback:", err);
      filters = fallbackExtract(query);
    }

    const ranked = offices
      .map((office) => ({
        ...office,
        _score: scoreOffice(office, filters),
      }))
      .filter((office) => office._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 10);

    return Response.json({
      query,
      filters,
      results: ranked,
    });
  } catch (error) {
    console.error("AI search error:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}