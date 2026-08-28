// Upstash Redis (REST API — works from serverless/edge, no persistent connection).
// Every helper here degrades gracefully to "no cache" when UPSTASH_REDIS_REST_URL /
// UPSTASH_REDIS_REST_TOKEN aren't set, or if Redis itself errors — caching is a
// performance optimization, never a hard dependency for correctness.
import { Redis } from "@upstash/redis";

let client = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    // Plain (non-base64) responses — simpler, and supported by both real
    // Upstash and the local dev shim (scripts/dev/upstash-rest-shim.js).
    responseEncoding: false,
  });
}

export function isCacheEnabled() {
  return client !== null;
}

/**
 * Cache-aside helper: returns the cached value for `key` if present, otherwise
 * calls `fn()`, caches the result for `ttlSeconds`, and returns it. Records a
 * hit/miss counter (see getCacheStats) either way. Resilient to Redis being
 * unavailable or misconfigured — falls through to calling `fn()` directly.
 */
export async function getOrSetCache(key, ttlSeconds, fn) {
  if (!client) return fn();

  try {
    const cached = await client.get(key);
    if (cached !== null && cached !== undefined) {
      recordCacheEvent("hit").catch(() => {});
      return cached;
    }
  } catch (err) {
    console.warn("Redis GET failed, bypassing cache:", err.message);
    return fn();
  }

  recordCacheEvent("miss").catch(() => {});
  const value = await fn();

  try {
    await client.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.warn("Redis SET failed, continuing without caching:", err.message);
  }

  return value;
}

const CACHE_EVENT_KEYS = { hit: "metrics:cache:hits", miss: "metrics:cache:misses" };

async function recordCacheEvent(kind) {
  if (!client) return;
  await client.incr(CACHE_EVENT_KEYS[kind]);
}

/** Hit rate + raw counters, for /api/metrics. */
export async function getCacheStats() {
  if (!client) return { enabled: false, hits: 0, misses: 0, hitRate: null };
  const [hits, misses] = await Promise.all([
    client.get("metrics:cache:hits").catch(() => 0),
    client.get("metrics:cache:misses").catch(() => 0),
  ]);
  const h = Number(hits) || 0;
  const m = Number(misses) || 0;
  const total = h + m;
  return { enabled: true, hits: h, misses: m, hitRate: total ? h / total : null };
}

/** A stable cache key from a set of query params/args (order-independent). */
export function cacheKey(namespace, params) {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `${namespace}:${sorted}`;
}

export { client as redisClient };
