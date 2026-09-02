// Reciprocal Rank Fusion — no DB/network imports, so it's trivially unit-testable
// in isolation from src/lib/rag/retrieve.js (which wires it up to real Postgres).
const RRF_K = 60; // standard constant from the original RRF paper (Cormack et al.)

/**
 * score(doc) = sum over each ranked list it appears in of 1 / (k + rank).
 * Doesn't require the lists' raw scores to be comparable, which is exactly
 * the problem when combining cosine similarity with ts_rank_cd.
 *
 * @param {{ id: string }[][]} rankedLists — each list ordered best-first
 */
export function reciprocalRankFusion(rankedLists, { k = RRF_K } = {}) {
  const scores = new Map(); // id -> { score, doc }

  for (const list of rankedLists) {
    list.forEach((doc, index) => {
      const rank = index + 1;
      const existing = scores.get(doc.id);
      const contribution = 1 / (k + rank);
      if (existing) {
        existing.score += contribution;
      } else {
        scores.set(doc.id, { score: contribution, doc });
      }
    });
  }

  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .map(({ doc, score }) => ({ ...doc, fusedScore: score }));
}
