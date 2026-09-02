// Generates a synthetic office dataset for benchmarking, isolated in its own
// `BenchOffice` table (raw SQL, not a Prisma model) so it never touches real
// app data. Populates a tsvector column inline (no trigger needed — this is a
// one-off bulk load, not an ongoing write path).
//
// Usage: node scripts/benchmark/generate-synthetic.js --count 10000
const { faker } = require("@faker-js/faker");
const { getPrismaClient } = require("../_lib/db");

const prisma = getPrismaClient();

const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Peshawar", "Multan", "Faisalabad", "Quetta", "Sialkot"];
const CATEGORIES = ["NADRA", "Passport", "Driving License", "Traffic", "Utilities", "Police", "Excise", "Land", "Courts", "Post Office"];
const BATCH_SIZE = 500;

function parseArgs() {
  const args = process.argv.slice(2);
  const countIdx = args.indexOf("--count");
  const count = countIdx >= 0 ? Number(args[countIdx + 1]) : 10000;
  if (!Number.isFinite(count) || count <= 0) throw new Error("Invalid --count");
  return { count };
}

async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "BenchOffice" (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      category TEXT NOT NULL,
      area TEXT NOT NULL,
      address TEXT NOT NULL,
      "searchVector" tsvector
    )
  `);
}

function randomRow() {
  const city = faker.helpers.arrayElement(CITIES);
  const category = faker.helpers.arrayElement(CATEGORIES);
  const area = faker.location.street();
  const name = `${category} Office (${faker.company.name()})`;
  const address = `${faker.location.streetAddress()}, ${area}, ${city}`;
  return { name, city, category, area, address };
}

async function insertBatch(rows) {
  const values = [];
  const params = [];
  rows.forEach((row, i) => {
    const base = i * 5;
    const [$name, $city, $category, $area, $address] = [1, 2, 3, 4, 5].map((n) => `$${base + n}`);
    values.push(
      `(${$name}, ${$city}, ${$category}, ${$area}, ${$address}, to_tsvector('english', ${$name} || ' ' || ${$category} || ' ' || ${$city} || ' ' || ${$area} || ' ' || ${$address}))`
    );
    params.push(row.name, row.city, row.category, row.area, row.address);
  });

  await prisma.$executeRawUnsafe(
    `INSERT INTO "BenchOffice" (name, city, category, area, address, "searchVector") VALUES ${values.join(",")}`,
    ...params
  );
}

async function main() {
  const { count } = parseArgs();
  await ensureTable();

  console.log(`Clearing existing BenchOffice rows...`);
  await prisma.$executeRawUnsafe(`TRUNCATE "BenchOffice" RESTART IDENTITY`);

  console.log(`Generating ${count} synthetic offices...`);
  let inserted = 0;
  while (inserted < count) {
    const batchSize = Math.min(BATCH_SIZE, count - inserted);
    const rows = Array.from({ length: batchSize }, randomRow);
    await insertBatch(rows);
    inserted += batchSize;
    if (inserted % 5000 === 0 || inserted === count) {
      console.log(`  ${inserted}/${count} rows inserted`);
    }
  }

  const rows = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "BenchOffice"`);
  console.log(`Done. BenchOffice now has ${rows[0].count} rows.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
