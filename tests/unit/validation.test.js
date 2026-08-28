import { describe, it, expect } from "vitest";
import { searchQuerySchema, aiSearchBodySchema, chatBodySchema } from "@/lib/validation/search";

describe("searchQuerySchema", () => {
  it("applies defaults when nothing is provided", () => {
    const parsed = searchQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
    expect(parsed.q).toBeUndefined();
  });

  it("coerces page/pageSize from query-string strings", () => {
    const parsed = searchQuerySchema.parse({ page: "3", pageSize: "10" });
    expect(parsed.page).toBe(3);
    expect(parsed.pageSize).toBe(10);
  });

  it("rejects a pageSize over the max", () => {
    expect(() => searchQuerySchema.parse({ pageSize: "999" })).toThrow();
  });

  it("rejects a non-numeric page", () => {
    expect(() => searchQuerySchema.parse({ page: "abc" })).toThrow();
  });

  it("trims whitespace-only q down to undefined", () => {
    const parsed = searchQuerySchema.parse({ q: "   " });
    expect(parsed.q).toBeUndefined();
  });
});

describe("aiSearchBodySchema", () => {
  it("rejects an empty query", () => {
    expect(() => aiSearchBodySchema.parse({ query: "" })).toThrow();
  });

  it("rejects a query over 200 chars", () => {
    expect(() => aiSearchBodySchema.parse({ query: "a".repeat(201) })).toThrow();
  });

  it("accepts a normal query", () => {
    expect(aiSearchBodySchema.parse({ query: "nadra lahore" }).query).toBe("nadra lahore");
  });
});

describe("chatBodySchema", () => {
  it("rejects an empty messages array", () => {
    expect(() => chatBodySchema.parse({ messages: [] })).toThrow();
  });

  it("rejects an invalid role", () => {
    expect(() =>
      chatBodySchema.parse({ messages: [{ role: "bot", content: "hi" }] })
    ).toThrow();
  });

  it("accepts a valid conversation", () => {
    const parsed = chatBodySchema.parse({
      messages: [{ role: "user", content: "How do I renew my CNIC?" }],
    });
    expect(parsed.messages).toHaveLength(1);
  });
});
