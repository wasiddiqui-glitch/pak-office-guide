const fs = require("fs");
const path = require("path");
const readline = require("readline");

const dataPath = path.join(__dirname, "../src/data/offices.json");

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
  const city = await ask("City: ");
  const area = await ask("Area: ");
  const category = await ask("Category (NADRA / Passport / Driving License etc): ");
  const address = await ask("Address: ");
  const phone = await ask("Phone (optional): ");
  const website = await ask("Website (optional): ");
  const hours = await ask("Hours (optional): ");

  const requirementsInput = await ask("Requirements (comma separated): ");
  const stepsInput = await ask("Steps (comma separated): ");
  const feesInput = await ask("Fees (comma separated): ");

  const requirements = requirementsInput
    ? requirementsInput.split(",").map((r) => r.trim())
    : [];

  const steps = stepsInput
    ? stepsInput.split(",").map((s) => s.trim())
    : [];

  const fees = feesInput
    ? feesInput.split(",").map((f) => f.trim())
    : [];

  const raw = fs.readFileSync(dataPath, "utf-8");
  const offices = JSON.parse(raw);

  const newOffice = {
    id: Date.now().toString(),
    name,
    city,
    area,
    category,
    address,
    phone,
    website,
    hours,
    requirements,
    steps,
    fees,
    lastUpdated: new Date().toISOString().split("T")[0],
  };

  offices.push(newOffice);

  fs.writeFileSync(dataPath, JSON.stringify(offices, null, 2));

  console.log("\n✅ Office added successfully!\n");

  rl.close();
}

main();