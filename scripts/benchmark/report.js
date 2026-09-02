// Formats benchmark/results/*.json into a copy-pasteable Markdown table.
// Usage: node scripts/benchmark/report.js
const fs = require("fs");
const path = require("path");

const RESULTS_DIR = path.join(__dirname, "../../benchmark/results");

function main() {
  const files = fs
    .readdirSync(RESULTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    console.log("No benchmark results found — run `npm run bench:run -- --label <name>` first.");
    return;
  }

  const rows = files.map((f) => JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, f), "utf-8")));

  console.log("| Scale | Rows | Seq scan (avg/p95) | GIN index (avg/p95) | Index speedup | Uncached | Cached (Redis) | Cache speedup |");
  console.log("|---|---|---|---|---|---|---|---|");
  for (const r of rows) {
    console.log(
      `| ${r.label} | ${r.rowCount.toLocaleString()} | ${r.withoutIndex.avgMs}ms / ${r.withoutIndex.p95Ms}ms | ${r.withIndex.avgMs}ms / ${r.withIndex.p95Ms}ms | ${r.summary.indexSpeedupFactor}x | ${r.cache.uncachedMs}ms | ${r.cache.cachedMs}ms | ${r.summary.cacheSpeedupFactor}x |`
    );
  }
}

main();
