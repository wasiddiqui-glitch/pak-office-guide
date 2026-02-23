import fs from "fs";

const data = JSON.parse(fs.readFileSync("src/data/offices.json", "utf-8"));

const defaultRequirements = [
  "Original CNIC / B-Form",
  "Copy of CNIC",
  "Supporting documents (if applicable)"
];

const defaultSteps = [
  "Take a token / queue number",
  "Document verification",
  "Biometrics and photo capture",
  "Receive receipt / collection timeline"
];

const defaultFees = [
  "Standard NADRA service fees apply (verify at center)"
];

const defaultNotes = [
  "Arrive early to avoid long queues",
  "Bring extra copies of documents",
  "Always verify requirements before visiting"
];

const fixed = data.map((o) => {
  if (o.category !== "NADRA") return o;

  return {
    ...o,
    requirements: o.requirements && o.requirements.length ? o.requirements : defaultRequirements,
    steps: o.steps && o.steps.length ? o.steps : defaultSteps,
    fees: o.fees && o.fees.length ? o.fees : defaultFees,
    notes: o.notes && o.notes.length ? o.notes : defaultNotes,
    googleMapsLink:
      o.googleMapsLink ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address || `${o.name} ${o.city}`)}`,
  };
});

fs.writeFileSync("src/data/offices.json", JSON.stringify(fixed, null, 2));
console.log("✅ NADRA data normalized");
