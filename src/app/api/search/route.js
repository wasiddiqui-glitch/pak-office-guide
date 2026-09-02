import { searchOffices } from "@/lib/search/officeSearch";
import { searchQuerySchema, parseSearchParams } from "@/lib/validation/search";
import { withErrorHandling } from "@/lib/http/errors";
import { enforceRateLimit } from "@/lib/rateLimit";
import { getOrSetCache, cacheKey } from "@/lib/cache/redis";
import { recordSearch } from "@/lib/metrics";

const SEARCH_CACHE_TTL_SECONDS = 60;

export const GET = withErrorHandling(async (req) => {
  await enforceRateLimit("search", req);

  const params = parseSearchParams(req, searchQuerySchema);
  const start = Date.now();

  const key = cacheKey("search", params);
  const data = await getOrSetCache(key, SEARCH_CACHE_TTL_SECONDS, () => searchOffices(params));

  await recordSearch({
    zeroResults: data.pagination.total === 0,
    latencyMs: Date.now() - start,
  });

  return Response.json({
    query: params.q ?? null,
    filters: { city: params.city ?? null, category: params.category ?? null, area: params.area ?? null },
    results: data.results,
    pagination: data.pagination,
  });
});
