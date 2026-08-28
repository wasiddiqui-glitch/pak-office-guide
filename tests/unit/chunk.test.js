import { describe, it, expect } from "vitest";
import { chunkGuide, chunkOffice, chunkEmbassy, chunkAll } from "@/lib/rag/chunk";

const guide = {
  slug: "renew-cnic-pakistan",
  title: "How to Renew Your CNIC",
  summary: "Renew your CNIC at any NADRA office.",
  category: "NADRA",
  city: null,
  estimatedTime: "1-3 hours",
  totalFees: "PKR 350-1500",
  requirements: ["Original CNIC"],
  steps: [
    { title: "Gather documents", body: "Bring your original CNIC and photocopies." },
    { title: "Visit NADRA", body: "Go to your nearest office." },
  ],
  tips: ["Arrive early"],
  faqs: [{ q: "Can someone else collect it?", a: "No, biometrics require you in person." }],
};

const office = {
  id: "lahore-nadra-gulberg",
  name: "NADRA Registration Center (Gulberg)",
  city: "Lahore",
  category: "NADRA",
  area: "Gulberg",
  address: "Gulberg, Lahore",
  hours: "Mon-Fri 9-5",
  phone: null,
  requirements: ["Original CNIC"],
  steps: ["Take a token"],
  fees: ["Fees vary"],
  notes: ["Arrive early"],
};

const embassy = {
  id: "pak-embassy-washington",
  name: "Embassy of Pakistan",
  city: "Washington D.C.",
  country: "United States",
  region: "North America",
  address: "3517 International Court NW",
  hours: "Mon-Fri 9-5",
  phone: "+1-202-243-6500",
  services: ["Passport issuance"],
  requirements: ["Valid appointment"],
  steps: ["Book an appointment"],
  fees: ["Passport: USD 100"],
  notes: ["Cash not accepted"],
};

describe("chunkGuide", () => {
  it("produces one overview chunk, one chunk per step, a tips chunk, and one per FAQ", () => {
    const chunks = chunkGuide(guide);
    // 1 overview + 2 steps + 1 tips + 1 faq = 5
    expect(chunks).toHaveLength(5);
    expect(chunks[0].content).toContain("Guide: How to Renew Your CNIC");
    expect(chunks.some((c) => c.title.includes("Gather documents"))).toBe(true);
    expect(chunks.some((c) => c.content.includes("Q: Can someone else collect it?"))).toBe(true);
  });

  it("every chunk has non-empty title and content", () => {
    for (const c of chunkGuide(guide)) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.content.length).toBeGreaterThan(0);
    }
  });
});

describe("chunkOffice", () => {
  it("produces exactly one chunk containing the office's key fields", () => {
    const chunks = chunkOffice(office);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toContain("NADRA Registration Center (Gulberg)");
    expect(chunks[0].content).toContain("Gulberg, Lahore");
    expect(chunks[0].content).toContain("Take a token");
  });
});

describe("chunkEmbassy", () => {
  it("produces exactly one chunk containing the embassy's key fields", () => {
    const chunks = chunkEmbassy(embassy);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toContain("Embassy of Pakistan");
    expect(chunks[0].content).toContain("Passport issuance");
  });
});

describe("chunkAll", () => {
  it("tags every chunk with its source type/id and a sequential chunkIndex", () => {
    const all = chunkAll({ guides: [guide], offices: [office], embassies: [embassy] });
    expect(all.length).toBe(5 + 1 + 1);

    const guideChunks = all.filter((c) => c.sourceType === "guide");
    expect(guideChunks.every((c) => c.sourceId === guide.slug)).toBe(true);
    expect(guideChunks.map((c) => c.chunkIndex)).toEqual([0, 1, 2, 3, 4]);

    const officeChunks = all.filter((c) => c.sourceType === "office");
    expect(officeChunks[0].sourceId).toBe(office.id);
  });
});
