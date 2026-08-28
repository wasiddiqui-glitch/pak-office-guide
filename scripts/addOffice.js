// Interactively adds a new office directly to Postgres (offices now live in
// the DB, not src/data/offices.json — that file is seed-only, see prisma/seed.js).
const readline = require("readline");
const { getPrismaClient } = require("./_lib/db");
const { slugify } = require("../src/lib/slug");

const prisma = getPrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log("\nAdd a new office\n");

  const name = await ask("Office name: ");
  const cityName = await ask("City: ");
  const area = await ask("Area: ");
  const categoryName = await ask("Category (NADRA / Passport / Driving License etc): ");
  const address = await ask("Address: ");
  const phone = await ask("Phone (optional): ");
  const website = await ask("Website (optional): ");
  const hours = await ask("Hours (optional): ");

  const requirementsInput = await ask("Requirements (comma separated): ");
  const stepsInput = await ask("Steps (comma separated): ");
  const feesInput = await ask("Fees (comma separated): ");

  const requirements = requirementsInput ? requirementsInput.split(",").map((r) => r.trim()) : [];
  const steps = stepsInput ? stepsInput.split(",").map((s) => s.trim()) : [];
  const fees = feesInput ? feesInput.split(",").map((f) => f.trim()) : [];

  const city = await prisma.city.upsert({
    where: { slug: slugify(cityName) },
    update: {},
    create: { name: cityName, slug: slugify(cityName) },
  });

  const category = await prisma.category.upsert({
    where: { slug: slugify(categoryName) },
    update: {},
    create: { name: categoryName, slug: slugify(categoryName) },
  });

  const office = await prisma.office.create({
    data: {
      id: `${slugify(cityName)}-${slugify(name)}-${Date.now().toString(36)}`,
      cityId: city.id,
      categoryId: category.id,
      name,
      area: area || null,
      address: address || null,
      phone: phone || null,
      website: website || null,
      hours: hours || null,
      lastUpdated: new Date(),
      requirements: { create: requirements.map((text, position) => ({ text, position })) },
      steps: { create: steps.map((text, position) => ({ text, position })) },
      fees: { create: fees.map((text, position) => ({ text, position })) },
    },
  });

  console.log(`\n✅ Office added successfully! (id: ${office.id})\n`);
  console.log("Tip: run this only against your dev database — it writes straight to Postgres.\n");

  rl.close();
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exitCode = 1;
});
