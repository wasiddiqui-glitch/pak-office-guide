// Runs against the real (seeded) Postgres database — see tests/setup/env.js
// and README's "Running tests" section. Assumes `npx prisma db seed` has been run.
import { describe, it, expect } from "vitest";
import { searchOffices } from "@/lib/search/officeSearch";

describe("searchOffices — ranking", () => {
  it("ranks an office whose name/category/city match the query above unrelated ones", async () => {
    const { results } = await searchOffices({ q: "passport islamabad", pageSize: 10 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category).toBe("Passport");
    expect(results[0].city).toBe("Islamabad");
  });

  it("filters by city slug", async () => {
    const { results } = await searchOffices({ city: "lahore", pageSize: 50 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((o) => o.citySlug === "lahore")).toBe(true);
  });

  it("filters by category slug", async () => {
    const { results } = await searchOffices({ category: "nadra", pageSize: 50 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((o) => o.categorySlug === "nadra")).toBe(true);
  });

  it("combines city + category + text filters", async () => {
    const { results } = await searchOffices({ city: "lahore", category: "nadra", q: "gulberg" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].area).toMatch(/gulberg/i);
  });

  it("returns an empty result set (not an error) for a nonsense query", async () => {
    const { results, pagination } = await searchOffices({ q: "zzzzznonexistentqueryzzzz" });
    expect(results).toEqual([]);
    expect(pagination.total).toBe(0);
  });

  it("paginates correctly", async () => {
    const pageOne = await searchOffices({ city: "lahore", page: 1, pageSize: 5 });
    const pageTwo = await searchOffices({ city: "lahore", page: 2, pageSize: 5 });

    expect(pageOne.results).toHaveLength(5);
    expect(pageOne.pagination.total).toBe(pageTwo.pagination.total);
    // no overlap between pages
    const idsOne = new Set(pageOne.results.map((o) => o.id));
    for (const o of pageTwo.results) expect(idsOne.has(o.id)).toBe(false);
  });
});
