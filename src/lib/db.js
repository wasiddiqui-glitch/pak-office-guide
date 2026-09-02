// Prisma client singleton — reused across hot reloads in dev so we don't
// exhaust connections (https://pris.ly/d/help/next-js-best-practices).
//
// Prisma 7 client instances connect through a driver adapter rather than a
// bare connection string. We use @prisma/adapter-pg (node-postgres) against
// DIRECT_DATABASE_URL — the raw TCP Postgres URL (as opposed to DATABASE_URL,
// which for a local `prisma dev` database is an HTTP proxy the `pg` driver
// can't speak, but is what the Prisma CLI itself uses for migrate/studio).
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "@/generated/prisma/client";

// Re-exported so callers building raw SQL (Prisma.sql / Prisma.join) always go
// through this same module instance as the `prisma` client below — importing
// `Prisma` separately from "@/generated/prisma/client" elsewhere risks a second
// bundled copy, whose Sql fragments the query engine won't recognize as raw
// (they get JSON-stringified as a plain parameter instead of spliced in).
export { Prisma };

const globalForPrisma = globalThis;

const RETRYABLE_CODES = new Set(["P1017", "P1001", "P1002", "ECONNREFUSED", "ECONNRESET"]);

function isRetryable(err) {
  return RETRYABLE_CODES.has(err?.code) || /connection/i.test(err?.message ?? "");
}

/**
 * Retries a query up to `attempts` times (with a short linear backoff) on
 * transient connection errors — Postgres dropping/refusing an idle-pool
 * connection under bursty concurrency (e.g. many Next.js build workers
 * prerendering pages at once) is common enough against small/serverless
 * Postgres instances that this is worth handling generically rather than
 * per call site.
 */
async function withConnectionRetry(query, args, attempts = 5, delayMs = 250) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await query(args);
    } catch (err) {
      if (attempt === attempts || !isRetryable(err)) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}

function createClient() {
  const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DIRECT_DATABASE_URL (or DATABASE_URL) is not set — see .env.example."
    );
  }
  // Small pool max: Next.js prerenders/builds pages across several *separate*
  // worker processes, each getting its own Pool (module singletons don't span
  // processes) — so the real fan-out is workers × max, easily exceeding what a
  // small Postgres (e.g. local `prisma dev`, which itself suggests a total
  // connection_limit=10) can hold. Queueing within a small pool per worker is
  // fine; a large one caused the shared local dev Postgres to drop connections
  // (and, once, crash outright) under a 7-worker build.
  const adapter = new PrismaPg({ connectionString, max: 2 });
  return new PrismaClient({ adapter }).$extends({
    name: "connection-retry",
    query: {
      $allOperations: ({ query, args }) => withConnectionRetry(query, args),
    },
  });
}

export const prisma = globalForPrisma.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
