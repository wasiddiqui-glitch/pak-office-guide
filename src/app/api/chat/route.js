import OpenAI from "openai";
import guides from "@/data/guides.json";
import offices from "@/data/offices.json";
import embassies from "@/data/embassies.json";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function normalize(s) {
  return String(s || "").toLowerCase();
}

function extractTerms(query) {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3)
    .slice(0, 12);
}

function scoreGuide(guide, terms) {
  let score = 0;
  const title = normalize(guide.title);
  const slug = normalize(guide.slug);
  const category = normalize(guide.category);
  const fullText = normalize(
    [
      guide.summary,
      guide.tips?.join(" "),
      guide.faqs?.map((f) => f.q + " " + f.a).join(" "),
      guide.steps?.map((s) => s.title + " " + s.body).join(" "),
    ].join(" ")
  );

  for (const term of terms) {
    if (title.includes(term)) score += 5;
    if (slug.includes(term)) score += 3;
    if (category.includes(term)) score += 4;
    if (fullText.includes(term)) score += 1;
  }
  return score;
}

function scoreOffice(office, terms) {
  let score = 0;
  const name = normalize(office.name);
  const city = normalize(office.city);
  const area = normalize(office.area);
  const category = normalize(office.category);
  const address = normalize(office.address);

  for (const term of terms) {
    if (name.includes(term)) score += 3;
    if (city.includes(term)) score += 2;
    if (area.includes(term)) score += 2;
    if (category.includes(term)) score += 3;
    if (address.includes(term)) score += 1;
  }
  return score;
}

function scoreEmbassy(embassy, terms) {
  let score = 0;
  const text = normalize(
    [embassy.name, embassy.city, embassy.country, embassy.region, embassy.services?.join(" ")].join(" ")
  );
  for (const term of terms) {
    if (text.includes(term)) score += 2;
  }
  return score;
}

function buildGuideContext(guide) {
  const lines = [`GUIDE: ${guide.title} (${guide.estimatedTime}, ${guide.totalFees})`];
  lines.push(`Summary: ${guide.summary}`);

  if (guide.requirements?.length) {
    lines.push(`Requirements: ${guide.requirements.join("; ")}`);
  }
  if (guide.steps?.length) {
    lines.push(
      `Steps:\n${guide.steps.map((s, i) => `  ${i + 1}. ${s.title} — ${s.body.slice(0, 200)}`).join("\n")}`
    );
  }
  if (guide.tips?.length) {
    lines.push(`Tips: ${guide.tips.join("; ")}`);
  }
  if (guide.faqs?.length) {
    lines.push(
      `FAQs:\n${guide.faqs.map((f) => `  Q: ${f.q}\n  A: ${f.a}`).join("\n")}`
    );
  }
  return lines.join("\n");
}

function buildOfficeContext(office) {
  const lines = [`OFFICE: ${office.name} — ${office.city}, ${office.area}`];
  lines.push(`Category: ${office.category} | Hours: ${office.hours || "N/A"}`);
  lines.push(`Address: ${office.address}`);
  if (office.requirements?.length) {
    lines.push(`Requirements: ${office.requirements.slice(0, 4).join("; ")}`);
  }
  if (office.fees?.length) {
    lines.push(`Fees: ${office.fees.slice(0, 3).join("; ")}`);
  }
  return lines.join("\n");
}

function buildEmbassyContext(embassy) {
  const lines = [`EMBASSY: ${embassy.name} — ${embassy.city}, ${embassy.country}`];
  lines.push(`Hours: ${embassy.hours || "N/A"} | Phone: ${embassy.phone || "N/A"}`);
  if (embassy.services?.length) {
    lines.push(`Services: ${embassy.services.slice(0, 5).join(", ")}`);
  }
  return lines.join("\n");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages are required." }, { status: 400 });
    }

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) {
      return Response.json({ error: "No user message found." }, { status: 400 });
    }

    const query = lastUserMsg.content.trim();
    if (query.length > 500) {
      return Response.json({ error: "Message too long." }, { status: 400 });
    }

    const terms = extractTerms(query);

    // Score and rank
    const topGuides = guides
      .map((g) => ({ ...g, _score: scoreGuide(g, terms) }))
      .filter((g) => g._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 2);

    const topOffices = offices
      .map((o) => ({ ...o, _score: scoreOffice(o, terms) }))
      .filter((o) => o._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 4);

    const topEmbassies = embassies
      .map((e) => ({ ...e, _score: scoreEmbassy(e, terms) }))
      .filter((e) => e._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 2);

    // Build sources list (for UI links)
    const sources = [
      ...topGuides.map((g) => ({ type: "guide", slug: g.slug, title: g.title, emoji: g.emoji })),
      ...topOffices.map((o) => ({ type: "office", id: o.id, name: o.name, city: o.city })),
      ...topEmbassies.map((e) => ({ type: "embassy", id: e.id, name: e.name, city: e.city })),
    ];

    // Build context string
    const contextParts = [];
    for (const g of topGuides) contextParts.push(buildGuideContext(g));
    for (const o of topOffices) contextParts.push(buildOfficeContext(o));
    for (const e of topEmbassies) contextParts.push(buildEmbassyContext(e));
    const context = contextParts.join("\n\n---\n\n");
    const hasContext = context.length > 0;

    // Fallback without OpenAI
    if (!client) {
      const answer = hasContext
        ? `Here's what I found in our database. Check the links below for full details.`
        : `I couldn't find specific information about that. Try the Search tab or browse the Guides section.`;
      return Response.json({ answer, sources });
    }

    const systemPrompt = `You are a helpful assistant for Pakistan Office Guide — a website that helps people navigate Pakistani government offices and procedures.

Answer ONLY based on the data provided below. Do not use general knowledge or make up fees, addresses, or steps.
Be concise and practical. Use bullet points for lists.
If the data doesn't fully answer the question, say so and suggest the user check the linked guide or search page.

${
  hasContext
    ? `DATA FROM OUR DATABASE:\n\n${context}`
    : "No matching data found in our database for this query."
}

Rules:
- Only use information from the data above
- Keep your answer under 300 words
- Don't mention guide slugs or office IDs in your text — they'll be shown as clickable links separately
- If no data matches, say so honestly and suggest using the Search or Guides section`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        // Include last 3 turns of conversation for context
        ...messages.slice(-6),
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const answer = response.choices[0].message.content;
    return Response.json({ answer, sources });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
