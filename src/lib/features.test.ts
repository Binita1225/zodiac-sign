import { describe, it, expect } from "vitest";
import * as A from "astronomy-engine";
import { ascendant, bigThree, moonInfo, planetStatuses, zodiacSeason, zonedToUtc } from "@/lib/sky";
import { birthdayInfo, chineseZodiac, lifePath } from "@/lib/birthday";
import { compatibilityScore } from "@/lib/horoscope";
import { touchStreak } from "@/lib/user";

const angleDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe("sky", () => {
  it("rising point equals the Sun's longitude when its centre crosses the eastern horizon", () => {
    for (const [lat, lon] of [[51.5, -0.13], [27.72, 85.32], [-33.87, 151.21]]) {
      const obs = new A.Observer(lat, lon, 0);
      // Geometric altitude 0 (not "sunrise", which adds refraction + the Sun's radius).
      const t = A.SearchAltitude(A.Body.Sun, obs, +1, new Date("2024-03-01T00:00:00Z"), 2, 0)!.date;
      expect(angleDiff(ascendant(t, lat, lon), A.SunPosition(t).elon)).toBeLessThan(0.2);
    }
  });

  it("converts birth-place wall time to UTC, including historical offsets", () => {
    // Nepal was UTC+5:30 until 1986, +5:45 after.
    expect(zonedToUtc(1980, 6, 1, 12, 0, "Asia/Kathmandu").toISOString()).toBe("1980-06-01T06:30:00.000Z");
    expect(zonedToUtc(2000, 6, 1, 12, 0, "Asia/Kathmandu").toISOString()).toBe("2000-06-01T06:15:00.000Z");
    // New York summer time (UTC−4) vs winter (UTC−5).
    expect(zonedToUtc(2020, 7, 4, 9, 0, "America/New_York").toISOString()).toBe("2020-07-04T13:00:00.000Z");
    expect(zonedToUtc(2020, 1, 4, 9, 0, "America/New_York").toISOString()).toBe("2020-01-04T14:00:00.000Z");
  });

  it("knows the January 2024 full moon", () => {
    const m = moonInfo(new Date("2024-01-25T17:54:00Z"));
    expect(m.phase).toBe("Full Moon");
    expect(m.illumination).toBeGreaterThan(0.99);
  });

  it("finds the next full and new moon after now", () => {
    const now = new Date("2024-01-10T00:00:00Z");
    const m = moonInfo(now);
    expect(m.nextFull > now && m.nextNew > now).toBe(true);
    expect(m.nextNew.toISOString().slice(0, 10)).toBe("2024-01-11");
  });

  it("detects Mercury retrograde (1–25 April 2024)", () => {
    const inside = planetStatuses(new Date("2024-04-10T12:00:00Z")).find((p) => p.name === "Mercury")!;
    expect(inside.retrograde).toBe(true);
    expect(inside.until!.toISOString().slice(0, 10)).toMatch(/2024-04-2[4-6]/);
    expect(planetStatuses(new Date("2024-05-10T12:00:00Z")).find((p) => p.name === "Mercury")!.retrograde).toBe(false);
  });

  it("knows the season and the countdown to the next one", () => {
    const s = zodiacSeason(new Date(2026, 9, 25));
    expect(s.sign.key).toBe("scorpio");
    expect(s.next.key).toBe("sagittarius");
    expect(s.daysLeft).toBe(28); // Oct 25 → Nov 22
    expect(zodiacSeason(new Date(2026, 11, 30)).nextStart.getFullYear()).toBe(2027);
  });

  it("computes a Big Three and hides rising without a birth time", () => {
    const place = { lat: 27.72, lon: 85.32, tz: "Asia/Kathmandu" };
    const full = bigThree({ y: 1995, m: 8, d: 10 }, { h: 6, mi: 30 }, place);
    expect(full.sun.key).toBe("leo");
    expect(full.rising).not.toBeNull();
    // ~6:30 am in August: the Sun has just risen, so rising is Leo (or the cusp with Cancer/Virgo).
    expect(["cancer", "leo", "virgo"]).toContain(full.rising!.key);
    expect(bigThree({ y: 1995, m: 8, d: 10 }, null, place).rising).toBeNull();
  });
});

describe("birthday", () => {
  it("life path keeps master numbers", () => {
    expect(lifePath(new Date(1990, 6, 15))).toBe(5); // 7 + 6 + 1 = 14 → 5
    expect(lifePath(new Date(1984, 10, 29))).toBe(8); // 11 + 11 + 22 = 44 → 8
    expect(lifePath(new Date(2000, 10, 9))).toBe(22); // 11 + 9 + 2 = 22 (kept as master)
  });

  it("Chinese year starts at Lunar New Year", () => {
    expect(chineseZodiac(new Date(1990, 0, 10)).animal).toBe("Snake");
    expect(chineseZodiac(new Date(1990, 1, 10)).animal).toBe("Horse");
    expect(chineseZodiac(new Date(2024, 5, 1))).toEqual({ animal: "Dragon", element: "Wood" });
  });

  it("age and countdown, including 29 February", () => {
    const b = birthdayInfo(new Date(2000, 1, 29), new Date(2025, 1, 27));
    expect(b.age).toBe(24);
    expect(b.daysToBirthday).toBe(1); // celebrated 28 Feb in non-leap years
    expect(birthdayInfo(new Date(2000, 4, 5), new Date(2025, 4, 5)).daysToBirthday).toBe(0);
    expect(birthdayInfo(new Date(2000, 4, 5), new Date(2025, 4, 5)).age).toBe(25);
    expect(b.birthstone).toBe("Amethyst");
  });
});

describe("compatibility", () => {
  it("breakdown scores are symmetric and in range", () => {
    const x = compatibilityScore("leo", "aries");
    const y = compatibilityScore("aries", "leo");
    expect(x).toEqual(y);
    for (const v of [x.love, x.friendship, x.work]) expect(v >= 20 && v <= 99).toBe(true);
  });
});

describe("streak", () => {
  it("counts consecutive days and resets after a gap", () => {
    const store = new Map<string, string>();
    globalThis.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    } as Storage;
    expect(touchStreak("2026-03-07")).toBe(1);
    expect(touchStreak("2026-03-07")).toBe(1);
    expect(touchStreak("2026-03-08")).toBe(2);
    expect(touchStreak("2026-03-09")).toBe(3);
    expect(touchStreak("2026-03-12")).toBe(1);
  });
});

import { chartAspects, natalChart, personalTransits, skyEvents } from "@/lib/chart";

describe("birth chart", () => {
  const birth = { date: "1995-08-10", time: "06:30", city: { name: "Kathmandu, Nepal", lat: 27.72, lon: 85.32, tz: "Asia/Kathmandu" } };

  it("places all ten planets, agrees with the Big Three, and uses whole-sign houses", () => {
    const c = natalChart(birth);
    expect(c.placements).toHaveLength(10);
    const sun = c.placements.find((p) => p.planet === "Sun")!;
    expect(sun.sign.key).toBe("leo");
    // Born just after sunrise: the Sun sits in the 1st or 12th house.
    expect([1, 12]).toContain(sun.house);
    // Rising sign's own planets are in house 1.
    for (const p of c.placements) if (p.sign.key === ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"][Math.floor(c.asc! / 30)]) expect(p.house).toBe(1);
  });

  it("has no houses without a birth time", () => {
    const c = natalChart({ ...birth, time: "" });
    expect(c.asc).toBeNull();
    expect(c.placements.every((p) => p.house === null)).toBe(true);
  });

  it("finds aspects within orb, tightest first", () => {
    const asp = chartAspects(natalChart(birth));
    expect(asp.length).toBeGreaterThan(0);
    for (let i = 1; i < asp.length; i++) expect(asp[i].orb).toBeGreaterThanOrEqual(asp[i - 1].orb);
  });

  it("transits at the birth moment are exact conjunctions", () => {
    const c = natalChart(birth);
    const tr = personalTransits(c, c.instant, 10);
    const self = tr.filter((t) => t.a === t.b);
    expect(self.length).toBeGreaterThan(0);
    for (const t of self) { expect(t.aspect.name).toBe("conjunction"); expect(t.orb).toBeLessThan(0.01); }
  });
});

describe("cosmic calendar", () => {
  it("knows autumn 2026: full moon in Taurus, Mercury direct mid-November", () => {
    const ev = skyEvents(new Date("2026-10-25T00:00:00Z"), 60);
    const full = ev.find((e) => e.kind === "full-moon")!;
    expect(full.date.toISOString().slice(0, 10)).toBe("2026-10-26");
    expect(full.sign!.key).toBe("taurus");
    const merc = ev.find((e) => e.kind === "station-direct" && e.planet === "Mercury")!;
    expect(merc.date.toISOString().slice(0, 10)).toMatch(/2026-11-1[2-4]/);
  });

  it("finds the 12 August 2026 total solar eclipse", () => {
    const ev = skyEvents(new Date("2026-07-01T00:00:00Z"), 30);
    const e = ev.find((x) => x.kind === "solar-eclipse")!;
    expect(e.date.toISOString().slice(0, 10)).toBe("2026-08-12");
    expect(e.title).toMatch(/^Total solar eclipse in Leo/);
  });

  it("is sorted by date", () => {
    const ev = skyEvents(new Date("2026-01-01T00:00:00Z"), 90);
    for (let i = 1; i < ev.length; i++) expect(ev[i].date >= ev[i - 1].date).toBe(true);
  });
});
