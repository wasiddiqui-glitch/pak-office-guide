// Exercises the /api/search route handler directly (import + call GET with a
// constructed Request) against the real seeded Postgres — no `next dev`
// server needed, which is the standard way to integration-test Next.js App
// Router route handlers.
import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/search/route";

function makeRequest(query) {
  return new Request(`http://localhost/api/search?${query}`);
}

describe("GET /api/search", () => {
  it("returns 200 with results + pagination for a valid query", async () => {
    const res = await GET(makeRequest("q=passport&city=islamabad"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.pagination).toMatchObject({ page: 1, pageSize: 20 });
  });

  it("returns 400 for an out-of-range pageSize", async () => {
    const res = await GET(makeRequest("pageSize=999"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for a non-numeric page", async () => {
    const res = await GET(makeRequest("page=notanumber"));
    expect(res.status).toBe(400);
  });

  it("defaults to page 1 / pageSize 20 with no params", async () => {
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.pageSize).toBe(20);
  });
});
