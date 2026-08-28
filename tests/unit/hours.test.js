import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isOpenNow } from "@/lib/hours";

function setNow(isoString) {
  vi.setSystemTime(new Date(isoString));
}

describe("isOpenNow", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns null for empty/unknown hours", () => {
    expect(isOpenNow("")).toBeNull();
    expect(isOpenNow(null)).toBeNull();
  });

  it("treats 24/7 as always open", () => {
    expect(isOpenNow("24/7")).toBe("open");
  });

  it("parses a day+time range and reports open during business hours", () => {
    // Wednesday 2026-03-25 is a Wednesday
    setNow("2026-03-25T10:00:00");
    expect(isOpenNow("Mon–Fri 9:00 AM – 5:00 PM")).toBe("open");
  });

  it("parses a day+time range and reports closed outside business hours", () => {
    setNow("2026-03-25T20:00:00");
    expect(isOpenNow("Mon–Fri 9:00 AM – 5:00 PM")).toBe("closed");
  });

  it("reports closed on a day outside the range", () => {
    // 2026-03-28 is a Saturday
    setNow("2026-03-28T10:00:00");
    expect(isOpenNow("Mon–Fri 9:00 AM – 5:00 PM")).toBe("closed");
  });

  it("returns null for unparseable multi-segment hours", () => {
    expect(isOpenNow("Mon-Fri 9-5 | Sat 9-1")).toBeNull();
  });
});
