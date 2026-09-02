// Postgres-backed office search: structured filters (city/category/area) combined
// with full-text ranking (ts_rank_cd over the weighted `searchVector` maintained by
// a DB trigger — see prisma/migrations/*/migration.sql) and real pagination.
//
// Built with $queryRawUnsafe + manual $1/$2/... placeholders rather than the
// Prisma.sql/Prisma.join tagged-template helpers: under Next.js's webpack
// bundling, nested Sql fragments spliced into an outer $queryRaw template were
// not reliably recognized as raw SQL (they got JSON-stringified as a plain
// parameter instead) — reproducible even from a single shared import site, so
// it's a bundler/runtime quirk rather than a module-dedup bug in this codebase.
// Manual placeholders sidestep that class-identity mechanism entirely.
import { prisma } from "@/lib/db";

/**
 * @param {{ q?: string, city?: string, category?: string, area?: string, page?: number, pageSize?: number }} params
 * @returns {Promise<{ results: object[], pagination: { page: number, pageSize: number, total: number, totalPages: number } }>}
 */
export async function searchOffices({ q, city, category, area, page = 1, pageSize = 20 } = {}) {
  const hasQuery = typeof q === "string" && q.trim().length > 0;
  const offset = (page - 1) * pageSize;

  const params = [];
  const p = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  const conditions = ["1=1"];
  if (city) conditions.push(`c.slug = ${p(city)}`);
  if (category) conditions.push(`cat.slug = ${p(category)}`);
  if (area) conditions.push(`o.area ILIKE ${p(`%${area}%`)}`);

  let rankExpr = "0::float";
  if (hasQuery) {
    const qPlaceholder = p(q);
    conditions.push(`o."searchVector" @@ plainto_tsquery('english', ${qPlaceholder})`);
    rankExpr = `ts_rank_cd(o."searchVector", plainto_tsquery('english', ${qPlaceholder}), 32)`;
  }

  const orderClause = hasQuery ? "rank DESC, o.name ASC" : "o.name ASC";
  const limitPlaceholder = p(pageSize);
  const offsetPlaceholder = p(offset);

  const sql = `
    SELECT
      o.id,
      o.name,
      o.area,
      o.address,
      o."googleMapsLink" AS "googleMapsLink",
      o.hours,
      o.website,
      o.phone,
      o.lat,
      o.lng,
      o."lastUpdated" AS "lastUpdated",
      c.name AS city,
      c.slug AS "citySlug",
      cat.name AS category,
      cat.slug AS "categorySlug",
      cat.icon AS "categoryIcon",
      ${rankExpr} AS rank,
      COUNT(*) OVER() AS "totalCount"
    FROM "Office" o
    JOIN "City" c ON o."cityId" = c.id
    JOIN "Category" cat ON o."categoryId" = cat.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY ${orderClause}
    LIMIT ${limitPlaceholder}
    OFFSET ${offsetPlaceholder}
  `;

  const rows = await prisma.$queryRawUnsafe(sql, ...params);

  const total = rows.length > 0 ? Number(rows[0].totalCount) : 0;
  const results = rows.map(({ totalCount, rank, ...rest }) => rest);

  return {
    results,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}
