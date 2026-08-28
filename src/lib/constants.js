// Small, slow-changing enumerations of the current office dataset — kept as
// constants (rather than a DB round-trip) since they only back NL-query
// heuristics (AI search filter extraction/fallback), not the source of truth
// for what's actually in Postgres.
export const OFFICE_CATEGORIES = ["NADRA", "Passport", "Driving License", "Traffic", "Utilities"];

export const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Peshawar",
  "Multan",
  "Faisalabad",
  "Quetta",
  "Sialkot",
];
