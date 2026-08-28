// Shared Prisma client factory for standalone Node scripts (seed, RAG build,
// benchmarks — anything run with plain `node`, outside the Next.js bundler,
// so it can't use the `@/...` alias or ESM import used by src/lib/db.js).
//
// See src/lib/db.js for why this goes through @prisma/adapter-pg + DIRECT_DATABASE_URL
// instead of a plain PrismaClient(datasourceUrl) — Prisma 7 client instances always
// connect through a driver adapter, and DATABASE_URL for local `prisma dev` databases
// is an HTTP proxy the `pg` driver can't speak directly.
require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../../src/generated/prisma/client");

function getPrismaClient() {
  const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_DATABASE_URL (or DATABASE_URL) is not set — see .env.example.");
  }
  const adapter = new PrismaPg({ connectionString, max: 5 });
  return new PrismaClient({ adapter });
}

module.exports = { getPrismaClient };
