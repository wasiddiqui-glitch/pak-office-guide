import { getCacheStats } from "@/lib/cache/redis";
import { getOperationalMetrics } from "@/lib/metrics";
import { withErrorHandling } from "@/lib/http/errors";

// Lightweight, self-hosted operational dashboard — cache hit rate, search
// latency, zero-result rate, OpenAI call latency. Works without Sentry/any
// paid monitoring account configured; see src/lib/metrics.js.
export const GET = withErrorHandling(async () => {
  const [cache, operational] = await Promise.all([getCacheStats(), getOperationalMetrics()]);
  return Response.json({ cache, ...operational });
});
