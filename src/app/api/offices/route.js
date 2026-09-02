import { z } from "zod";
import { getOfficesByIds } from "@/lib/offices";
import { withErrorHandling } from "@/lib/http/errors";
import { parseSearchParams } from "@/lib/validation/search";

// Looks up specific offices by id — used by the client-side Favorites page
// (localStorage holds ids only; office details need a server round-trip now
// that offices live in Postgres instead of a JSON file bundled with the client).
const idsQuerySchema = z.object({
  ids: z
    .string()
    .trim()
    .min(1)
    .transform((v) => v.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 100)),
});

export const GET = withErrorHandling(async (req) => {
  const { ids } = parseSearchParams(req, idsQuerySchema);
  const offices = await getOfficesByIds(ids);
  return Response.json({ offices });
});
