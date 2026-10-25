import { describe, it, expect } from "vitest";
import { ZODIACS, getZodiacFromDate } from "@/data/zodiacs";
import { compatibilityScore, getHoroscope, rng } from "@/lib/horoscope";
import { localISODate, parseLocalDate } from "@/lib/utils";

const at = (m: number, d: number) => new Date(2001, m - 1, d);

describe("getZodiacFromDate", () => {
  it("returns the right sign on the first and last day of every sign", () => {
    for (const z of ZODIACS) {
      expect(getZodiacFromDate(at(...z.start)).key).toBe(z.key);
      expect(getZodiacFromDate(at(...z.end)).key).toBe(z.key);
    }
  });

  it("handles Capricorn across the new year", () => {
    expect(getZodiacFromDate(at(12, 31)).key).toBe("capricorn");
    expect(getZodiacFromDate(at(1, 1)).key).toBe("capricorn");
  });

  it("covers every day of a leap year", () => {
    for (let d = new Date(2000, 0, 1); d.getFullYear() === 2000; d.setDate(d.getDate() + 1)) {
      const z = getZodiacFromDate(d);
      const [sm, sd] = z.start, [em, ed] = z.end;
      const md = (d.getMonth() + 1) * 100 + d.getDate();
      const inRange = sm * 100 + sd <= em * 100 + ed
        ? md >= sm * 100 + sd && md <= em * 100 + ed
        : md >= sm * 100 + sd || md <= em * 100 + ed;
      expect(inRange, `${localISODate(d)} -> ${z.key}`).toBe(true);
    }
  });
});

describe("local dates", () => {
  it("parses YYYY-MM-DD as a local date, not UTC", () => {
    const d = parseLocalDate("1995-03-21")!;
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([1995, 2, 21]);
    expect(getZodiacFromDate(d).key).toBe("aries");
  });

  it("rejects garbage", () => {
    expect(parseLocalDate("")).toBeNull();
    expect(parseLocalDate("not-a-date")).toBeNull();
  });

  it("formats the local day", () => {
    expect(localISODate(new Date(2024, 0, 5, 23, 59))).toBe("2024-01-05");
  });
});

describe("horoscope", () => {
  it("is deterministic per sign, period and day", () => {
    const now = new Date(2024, 5, 1, 9);
    expect(getHoroscope("leo", "today", now)).toEqual(getHoroscope("leo", "today", new Date(2024, 5, 1, 22)));
    expect(getHoroscope("leo", "today", now)).not.toEqual(getHoroscope("leo", "today", new Date(2024, 5, 2, 9)));
  });

  it("never produces an empty field", () => {
    for (const z of ZODIACS) {
      for (const p of ["today", "tomorrow", "week"] as const) {
        const h = getHoroscope(z.key, p, new Date(2024, 0, 1));
        for (const v of [h.general, h.love, h.career, h.health, h.oneLiner, h.luckyColor]) expect(v).toBeTruthy();
      }
    }
  });

  it("rng stays in [0, 1)", () => {
    const r = rng("x");
    for (let i = 0; i < 10_000; i++) {
      const v = r();
      expect(v >= 0 && v < 1).toBe(true);
    }
  });

  it("compatibility is symmetric", () => {
    for (const a of ZODIACS) for (const b of ZODIACS) {
      expect(compatibilityScore(a.key, b.key).score).toBe(compatibilityScore(b.key, a.key).score);
    }
  });
});
