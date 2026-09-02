// Benchmarks the BenchOffice table (see generate-synthetic.js) at whatever
// scale currently populates it: query latency with vs. without the GIN index,
// and cached vs. uncached latency through the real Redis cache helper.
//
// Usage: node scripts/benchmark/run.js --label 10k
const fs = require("fs");
const path = require("path");
const { getPrismaClient } = require("../_lib/db");

const prisma = getPrismaClient();

const SAMPLE_QUERIES = [
  "nadra",
  "passport office",
  "driving license lahore",
  "utilities karachi",
  "traffic islamabad",
  "excise land",
  "post office",
  "police station",
  "courts multan",
  "rawalpindi",
];
const SAMPLES_PER_QUERY = 5; // repeat each query a few times to smooth out noise

function parseArgs() {
  const args = process.argv.slice(2);
  const labelIdx = args.indexOf("--label");
  return { label: labelIdx >= 0 ? args[labelIdx + 1] : "unlabeled" };
}

function percentile(sorted, p) {
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

function summarize(samplesMs) {
  const sorted = [...samplesMs].sort((a, b) => a - b);
  return {
    avgMs: Number((samplesMs.reduce((a, b) => a + b, 0) / samplesMs.length).toFixed(2)),
    p50Ms: Number(percentile(sorted, 0.5).toFixed(2)),
    p95Ms: Number(percentile(sorted, 0.95).toFixed(2)),
    minMs: Number(sorted[0].toFixed(2)),
    maxMs: Number(sorted[sorted.length - 1].toFixed(2)),
    samples: samplesMs.length,
  };
}

async function timeQuery(q) {
  const start = performance.now();
  await prisma.$queryRawUnsafe(
    `SELECT id FROM "BenchOffice" WHERE "searchVector" @@ plainto_tsquery('english', $1) ORDER BY ts_rank_cd("searchVector", plainto_tsquery('english', $1), 32) DESC LIMIT 20`,
    q
  );
  return performance.now() - start;
}

async function runQuerySamples() {
  const samples = [];
  for (const q of SAMPLE_QUERIES) {
    for (let i = 0; i < SAMPLES_PER_QUERY; i++) {
      samples.push(await timeQuery(q));
    }
  }
  return samples;
}

async function dropIndex() {
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "bench_office_search_vector_idx"`);
}

async function createIndex() {
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "bench_office_search_vector_idx" ON "BenchOffice" USING GIN ("searchVector")`
  );
}

async function benchmarkCache(label) {
  const { getOrSetCache } = await import("../../src/lib/cache/redis.js");
  const key = `benchmark:${label}:${Date.now()}`;

  const uncachedStart = performance.now();
  await getOrSetCache(key, 60, () => timeQuery("nadra"));
  const uncachedMs = performance.now() - uncachedStart;

  const cachedStart = performance.now();
  await getOrSetCache(key, 60, () => timeQuery("nadra"));
  const cachedMs = performance.now() - cachedStart;

  return { uncachedMs: Number(uncachedMs.toFixed(2)), cachedMs: Number(cachedMs.toFixed(2)) };
}

async function main() {
  const { label } = parseArgs();

  /** @type {{ count: number }[]} */
  const countRows = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "BenchOffice"`);
  const { count } = countRows[0];
  console.log(`Benchmarking against ${count} rows in BenchOffice (label: ${label})...`);

  console.log("Dropping GIN index, measuring without-index latency...");
  await dropIndex();
  const withoutIndexSamples = await runQuerySamples();

  console.log("Creating GIN index, measuring with-index latency...");
  await createIndex();
  // Give Postgres a moment to finish building the index before measuring.
  await new Promise((r) => setTimeout(r, 500));
  const withIndexSamples = await runQuerySamples();

  console.log("Measuring cached vs. uncached latency...");
  const cache = await benchmarkCache(label);

  const result = {
    label,
    rowCount: count,
    timestamp: new Date().toISOString(),
    withoutIndex: summarize(withoutIndexSamples),
    withIndex: summarize(withIndexSamples),
    cache,
  };

  const speedup = result.withoutIndex.avgMs / result.withIndex.avgMs;
  const cacheSpeedup = result.cache.uncachedMs / result.cache.cachedMs;
  result.summary = {
    indexSpeedupFactor: Number(speedup.toFixed(1)),
    cacheSpeedupFactor: Number(cacheSpeedup.toFixed(1)),
  };

  const outDir = path.join(__dirname, "../../benchmark/results");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${label}.json`);
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2));

  console.log(`\nResults for ${label} (${count} rows):`);
  console.log(`  Without GIN index: avg ${result.withoutIndex.avgMs}ms, p95 ${result.withoutIndex.p95Ms}ms`);
  console.log(`  With GIN index:    avg ${result.withIndex.avgMs}ms, p95 ${result.withIndex.p95Ms}ms`);
  console.log(`  Index speedup:     ${result.summary.indexSpeedupFactor}x`);
  console.log(`  Uncached (Redis):  ${result.cache.uncachedMs}ms`);
  console.log(`  Cached (Redis):    ${result.cache.cachedMs}ms`);
  console.log(`  Cache speedup:     ${result.summary.cacheSpeedupFactor}x`);
  console.log(`\nWrote ${outFile}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
