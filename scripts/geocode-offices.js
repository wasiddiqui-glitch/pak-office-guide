// Geocodes all offices using OSM Nominatim (free, no API key).
// Adds lat/lng to each office entry in offices.json.
// Nominatim ToS: max 1 req/sec, must include a User-Agent.
//
// Run: node scripts/geocode-offices.js
// Safe to re-run — skips offices that already have coordinates.

const fs = require("fs");
const path = require("path");
const https = require("https");

const DATA_PATH = path.join(__dirname, "../src/data/offices.json");
const DELAY_MS = 1100; // stay safely under 1 req/sec

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function nominatimSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=pk`;
    const options = {
      headers: {
        "User-Agent": "PakistanOfficeGuide/1.0 (geocoding script)",
        Accept: "application/json",
      },
    };
    https.get(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.length > 0) {
            resolve({ lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) });
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on("error", reject);
  });
}

async function geocodeOffice(office) {
  // Try progressively simpler queries until we get a hit
  const queries = [
    `${office.name}, ${office.area}, ${office.city}, Pakistan`,
    `${office.name}, ${office.city}, Pakistan`,
    `${office.area}, ${office.city}, Pakistan`,
    `${office.city}, Pakistan`,
  ];

  for (const q of queries) {
    const result = await nominatimSearch(q);
    await sleep(DELAY_MS);
    if (result) return result;
  }
  return null;
}

async function main() {
  const offices = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const todo = offices.filter((o) => o.lat == null || o.lng == null);
  console.log(`${todo.length} offices need geocoding (${offices.length - todo.length} already done).`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < offices.length; i++) {
    const o = offices[i];
    if (o.lat != null && o.lng != null) continue;

    process.stdout.write(`[${i + 1}/${offices.length}] ${o.name} (${o.city}) … `);
    const coords = await geocodeOffice(o);

    if (coords) {
      offices[i] = { ...o, lat: coords.lat, lng: coords.lng };
      process.stdout.write(`✓ ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}\n`);
      success++;
    } else {
      process.stdout.write(`✗ not found\n`);
      failed++;
    }

    // Save after every 10 to preserve progress
    if ((success + failed) % 10 === 0) {
      fs.writeFileSync(DATA_PATH, JSON.stringify(offices, null, 2));
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(offices, null, 2));
  console.log(`\nDone. ${success} geocoded, ${failed} failed.`);
}

main().catch(console.error);
