import { describe, expect, it } from "vitest";
import {
  compareYmd,
  isLikelyPremiumWeekday,
  parseYmd,
  toYmd,
  todayYmdLocal,
  weekdayLocal,
} from "@/sections/weddings/weddingDate";

describe("weddingDate", () => {
  it("round-trips YYYY-MM-DD without timezone day shift", () => {
    expect(toYmd(2026, 3, 15)).toBe("2026-03-15");
    expect(parseYmd("2026-03-15")).toEqual({
      year: 2026,
      month: 3,
      day: 15,
    });
    expect(weekdayLocal("2026-03-15")).toBe(0); // Sunday local
  });

  it("rejects invalid calendar days", () => {
    expect(parseYmd("2026-02-31")).toBeNull();
    expect(parseYmd("not-a-date")).toBeNull();
  });

  it("compares YMD lexicographically safely", () => {
    expect(compareYmd("2026-01-02", "2026-01-10")).toBeLessThan(0);
    expect(todayYmdLocal(new Date(2026, 8, 13, 23, 30))).toBe("2026-09-13");
  });

  it("marks Friday/Saturday as likely premium weekdays only", () => {
    expect(isLikelyPremiumWeekday("2026-09-11")).toBe(true); // Friday
    expect(isLikelyPremiumWeekday("2026-09-12")).toBe(true); // Saturday
    expect(isLikelyPremiumWeekday("2026-09-13")).toBe(false); // Sunday
  });
});
