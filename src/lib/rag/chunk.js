// Content-aware chunking for RAG. Guides/offices/embassies already have
// natural semantic units (a step, an FAQ, an office record) — chunking along
// those boundaries gives cleaner, more citable chunks than a generic
// sliding-window text splitter, and keeps chunk count small for this dataset.
//
// Each chunk: { title, content } — `title` becomes the citation label shown
// to users; `content` is what gets embedded and stored for full-text search.

const MAX_CHUNK_WORDS = 220; // ~300 tokens; keeps embedding cost/latency small

function splitLongText(text) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= MAX_CHUNK_WORDS) return [text];
  const parts = [];
  for (let i = 0; i < words.length; i += MAX_CHUNK_WORDS) {
    parts.push(words.slice(i, i + MAX_CHUNK_WORDS).join(" "));
  }
  return parts;
}

export function chunkGuide(guide) {
  const chunks = [];

  const overviewParts = [
    `Guide: ${guide.title}`,
    guide.summary,
    guide.category ? `Category: ${guide.category}` : null,
    guide.city ? `City: ${guide.city}` : null,
    guide.estimatedTime ? `Estimated time: ${guide.estimatedTime}` : null,
    guide.totalFees ? `Total fees: ${guide.totalFees}` : null,
    guide.requirements?.length ? `Requirements: ${guide.requirements.join("; ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  chunks.push({ title: guide.title, content: overviewParts });

  for (const step of guide.steps || []) {
    for (const text of splitLongText(`${step.title}. ${step.body}`)) {
      chunks.push({ title: `${guide.title} — ${step.title}`, content: text });
    }
  }

  if (guide.tips?.length) {
    chunks.push({ title: `${guide.title} — Tips`, content: guide.tips.join("\n") });
  }

  for (const faq of guide.faqs || []) {
    chunks.push({ title: `${guide.title} — FAQ: ${faq.q}`, content: `Q: ${faq.q}\nA: ${faq.a}` });
  }

  return chunks;
}

export function chunkOffice(office) {
  const parts = [
    `Office: ${office.name} (${office.category}) — ${office.city}${office.area ? ", " + office.area : ""}`,
    office.address ? `Address: ${office.address}` : null,
    office.hours ? `Hours: ${office.hours}` : null,
    office.phone ? `Phone: ${office.phone}` : null,
    office.requirements?.length ? `Requirements: ${office.requirements.join("; ")}` : null,
    office.steps?.length ? `Steps: ${office.steps.join("; ")}` : null,
    office.fees?.length ? `Fees: ${office.fees.join("; ")}` : null,
    office.notes?.length ? `Notes: ${office.notes.join("; ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return [{ title: `${office.name} — ${office.city}`, content: parts }];
}

export function chunkEmbassy(embassy) {
  const parts = [
    `Embassy: ${embassy.name} — ${embassy.city}, ${embassy.country} (${embassy.region})`,
    embassy.address ? `Address: ${embassy.address}` : null,
    embassy.hours ? `Hours: ${embassy.hours}` : null,
    embassy.phone ? `Phone: ${embassy.phone}` : null,
    embassy.services?.length ? `Services: ${embassy.services.join("; ")}` : null,
    embassy.requirements?.length ? `Requirements: ${embassy.requirements.join("; ")}` : null,
    embassy.steps?.length ? `Steps: ${embassy.steps.join("; ")}` : null,
    embassy.fees?.length ? `Fees: ${embassy.fees.join("; ")}` : null,
    embassy.notes?.length ? `Notes: ${embassy.notes.join("; ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return [{ title: `${embassy.name} — ${embassy.city}`, content: parts }];
}

/** @returns {{ sourceType: string, sourceId: string, title: string, content: string, chunkIndex: number }[]} */
export function chunkAll({ guides = [], offices = [], embassies = [] }) {
  const all = [];

  for (const guide of guides) {
    chunkGuide(guide).forEach((c, i) =>
      all.push({ sourceType: "guide", sourceId: guide.slug, chunkIndex: i, ...c })
    );
  }
  for (const office of offices) {
    chunkOffice(office).forEach((c, i) =>
      all.push({ sourceType: "office", sourceId: office.id, chunkIndex: i, ...c })
    );
  }
  for (const embassy of embassies) {
    chunkEmbassy(embassy).forEach((c, i) =>
      all.push({ sourceType: "embassy", sourceId: embassy.id, chunkIndex: i, ...c })
    );
  }

  return all;
}
