// Parses office hours strings and returns open/closed/null status

const DAY_MAP = {
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0,
};

// Returns minutes since midnight for a time string like "9:00 AM", "09:00", "3:30 PM"
function parseTime(str) {
  str = str.trim();
  const isPM = /pm/i.test(str);
  const isAM = /am/i.test(str);
  const timePart = str.replace(/[apm\s]/gi, "");
  const [hStr, mStr] = timePart.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr ? parseInt(mStr, 10) : 0;
  if (isNaN(h)) return null;
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

// Returns array of valid JS day numbers (0=Sun, 1=Mon … 6=Sat) for a range like "Mon–Fri"
function parseDayRange(start, end) {
  const s = DAY_MAP[start.toLowerCase().slice(0, 3)];
  const e = DAY_MAP[end.toLowerCase().slice(0, 3)];
  if (s === undefined || e === undefined) return null;
  const days = [];
  let d = s;
  for (let i = 0; i <= 7; i++) {
    days.push(d);
    if (d === e) break;
    d = d === 6 ? 0 : d + 1;
  }
  return days;
}

/**
 * Returns "open" | "closed" | null (unknown)
 * null means we couldn't parse the string confidently.
 */
export function isOpenNow(hoursStr) {
  if (!hoursStr) return null;

  const lower = hoursStr.toLowerCase();

  // 24/7
  if (lower.includes("24/7")) return "open";

  // Clearly unknown
  if (
    lower.includes("varies") ||
    lower === "verify current hours" ||
    lower.includes("call to confirm") ||
    lower.includes("(verify")
  ) {
    // Still try to parse the time portion before giving up
  }

  // Unparseable complex multi-segment
  if (lower.includes("|")) return null;

  // Strip parenthetical notes and extra whitespace
  const stripped = hoursStr.replace(/\([^)]*\)/g, "").trim();

  const now = new Date();
  const today = now.getDay(); // 0=Sun … 6=Sat
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // ── Pattern A: "Mon–Fri 9:00 AM – 5:00 PM" or "Mon–Sat 09:00–17:00" ──────
  const dayTimeRe =
    /^([A-Za-z]+)[–\-]([A-Za-z]+)\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[–\-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i;
  const dtMatch = stripped.match(dayTimeRe);
  if (dtMatch) {
    const validDays = parseDayRange(dtMatch[1], dtMatch[2]);
    if (!validDays) return null;
    if (!validDays.includes(today)) return "closed";
    const openMin = parseTime(dtMatch[3]);
    let closeMin = parseTime(dtMatch[4]);
    if (openMin === null || closeMin === null) return null;
    if (closeMin === 0) closeMin = 1440; // midnight = end of day
    return nowMin >= openMin && nowMin < closeMin ? "open" : "closed";
  }

  // ── Pattern B: "Day–Day" with no time (e.g. "Mon–Sat (varies)") ──────────
  const dayOnlyRe = /^([A-Za-z]+)[–\-]([A-Za-z]+)\s*$/;
  if (dayOnlyRe.test(stripped)) return null;

  // ── Pattern C: plain time range — "9:00 AM – 5:00 PM" or "09:00–17:00" ──
  const timeOnlyRe =
    /^(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[–\-\-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i;
  const toMatch = stripped.match(timeOnlyRe);
  if (toMatch) {
    // No day specified → assume Mon–Sat
    if (today === 0) return "closed"; // Sunday
    const openMin = parseTime(toMatch[1]);
    let closeMin = parseTime(toMatch[2]);
    if (openMin === null || closeMin === null) return null;
    if (closeMin === 0) closeMin = 1440;
    return nowMin >= openMin && nowMin < closeMin ? "open" : "closed";
  }

  // ── Pattern D: "8 AM - 3:30 PM" (no minutes on start) ──────────────────
  const looseRe =
    /^(\d{1,2}\s*(?:AM|PM))\s*[\-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i;
  const looseMatch = stripped.match(looseRe);
  if (looseMatch) {
    if (today === 0) return "closed";
    const openMin = parseTime(looseMatch[1].replace(/(\d+)/, "$1:00"));
    let closeMin = parseTime(looseMatch[2]);
    if (openMin === null || closeMin === null) return null;
    if (closeMin === 0) closeMin = 1440;
    return nowMin >= openMin && nowMin < closeMin ? "open" : "closed";
  }

  return null;
}
