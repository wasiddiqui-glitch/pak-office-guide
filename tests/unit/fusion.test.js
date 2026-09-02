import { describe, it, expect } from "vitest";
import { reciprocalRankFusion } from "@/lib/rag/fusion";

describe("reciprocalRankFusion", () => {
  it("ranks a document appearing near the top of both lists above one appearing in only one list", () => {
    const vectorResults = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const keywordResults = [{ id: "a" }, { id: "c" }, { id: "d" }];

    const fused = reciprocalRankFusion([vectorResults, keywordResults]);

    expect(fused[0].id).toBe("a"); // rank 1 in both lists
    expect(fused.map((f) => f.id)).toContain("b");
    expect(fused.map((f) => f.id)).toContain("d");
  });

  it("a document that appears in both lists outranks one appearing in only one, even at a worse rank", () => {
    const vectorResults = [{ id: "only-vector" }, { id: "x" }, { id: "y" }, { id: "z" }];
    const keywordResults = [{ id: "w" }, { id: "x" }];

    const fused = reciprocalRankFusion([vectorResults, keywordResults]);
    const rankOf = (id) => fused.findIndex((f) => f.id === id);

    expect(rankOf("x")).toBeLessThan(rankOf("only-vector"));
  });

  it("returns an empty array for empty input lists", () => {
    expect(reciprocalRankFusion([[], []])).toEqual([]);
  });

  it("assigns higher fusedScore to earlier ranks", () => {
    const fused = reciprocalRankFusion([[{ id: "a" }, { id: "b" }, { id: "c" }]]);
    expect(fused[0].fusedScore).toBeGreaterThan(fused[1].fusedScore);
    expect(fused[1].fusedScore).toBeGreaterThan(fused[2].fusedScore);
  });
});
