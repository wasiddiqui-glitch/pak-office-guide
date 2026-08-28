// Sliding-window rate limiting via Upstash Redis. No-op (always allows) when
// Redis isn't configured, so local dev without Upstash credentials still works —
// same graceful-degradation pattern as src/lib/cache/redis.js.
import { Ratelimit } from "@upstash/ratelimit";
import { redisClient } from "@/lib/cache/redis";
import { tooManyRequests } from "@/lib/http/errors";

// Requests/minute per client IP. AI-backed routes are limited tighter since
// every request can cost real OpenAI dollars; plain DB search is cheap.
const LIMITS = {
  chat: { requests: 20, window: "60 s" },
  aiSearch: { requests: 20, window: "60 s" },
  search: { requests: 60, window: "60 s" },
};

const limiters = new Map();

function getLimiter(name) {
  if (!redisClient) return null;
  if (limiters.has(name)) return limiters.get(name);

  const { requests, window } = LIMITS[name];
  const limiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:${name}`,
    analytics: false,
  });
  limiters.set(name, limiter);
  return limiter;
}

function clientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

/**
 * Throws ApiError(429) if the caller has exceeded the limit for `name`
 * ("chat" | "aiSearch" | "search"). No-op if Redis isn't configured.
 */
export async function enforceRateLimit(name, req) {
  const limiter = getLimiter(name);
  if (!limiter) return;

  const identifier = clientIp(req);
  const { success, reset } = await limiter.limit(identifier);
  if (!success) {
    const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    throw tooManyRequests("Too many requests — please slow down.", retryAfterSeconds);
  }
}
