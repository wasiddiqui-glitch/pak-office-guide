// Lightweight, self-hosted operational counters — a working /api/metrics
// endpoint even when a full Sentry dashboard isn't configured (SENTRY_DSN unset).
// Stored in Redis so counters survive across serverless invocations; a no-op
// (metrics just won't accumulate) when Redis isn't configured.
import { redisClient } from "@/lib/cache/redis";

const LATENCY_SAMPLE_CAP = 200; // keep a rolling window, not an unbounded list

export async function recordSearch({ zeroResults, latencyMs }) {
  if (!redisClient) return;
  try {
    const ops = [redisClient.incr("metrics:search:count")];
    if (zeroResults) ops.push(redisClient.incr("metrics:search:zero_results"));
    if (typeof latencyMs === "number") {
      ops.push(
        redisClient
          .lpush("metrics:search:latency_ms", latencyMs)
          .then(() => redisClient.ltrim("metrics:search:latency_ms", 0, LATENCY_SAMPLE_CAP - 1))
      );
    }
    await Promise.all(ops);
  } catch (err) {
    console.warn("Failed to record search metrics:", err.message);
  }
}

export async function recordOpenAiCall({ operation, latencyMs }) {
  if (!redisClient) return;
  try {
    await Promise.all([
      redisClient.incr(`metrics:openai:${operation}:count`),
      typeof latencyMs === "number"
        ? redisClient
            .lpush(`metrics:openai:${operation}:latency_ms`, latencyMs)
            .then(() =>
              redisClient.ltrim(`metrics:openai:${operation}:latency_ms`, 0, LATENCY_SAMPLE_CAP - 1)
            )
        : null,
    ]);
  } catch (err) {
    console.warn("Failed to record OpenAI metrics:", err.message);
  }
}

function summarize(samples) {
  const nums = samples.map(Number).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return { avgMs: null, p95Ms: null, samples: 0 };
  const sorted = [...nums].sort((a, b) => a - b);
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
  return { avgMs: Math.round(avg), p95Ms: Math.round(p95), samples: nums.length };
}

export async function getOperationalMetrics() {
  if (!redisClient) {
    return { enabled: false };
  }

  const [
    searchCount,
    zeroResults,
    searchLatencies,
    chatLatencies,
    embeddingLatencies,
  ] = await Promise.all([
    redisClient.get("metrics:search:count").catch(() => 0),
    redisClient.get("metrics:search:zero_results").catch(() => 0),
    redisClient.lrange("metrics:search:latency_ms", 0, -1).catch(() => []),
    redisClient.lrange("metrics:openai:chat:latency_ms", 0, -1).catch(() => []),
    redisClient.lrange("metrics:openai:embedding:latency_ms", 0, -1).catch(() => []),
  ]);

  const total = Number(searchCount) || 0;
  const zero = Number(zeroResults) || 0;

  return {
    enabled: true,
    search: {
      count: total,
      zeroResultCount: zero,
      zeroResultRate: total ? zero / total : null,
      latency: summarize(searchLatencies),
    },
    openai: {
      chatLatency: summarize(chatLatencies),
      embeddingLatency: summarize(embeddingLatencies),
    },
  };
}
