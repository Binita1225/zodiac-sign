import * as A from "astronomy-engine";
import { ZODIACS, ZodiacSign, getZodiacFromDate } from "@/data/zodiacs";

// Tropical zodiac: each sign is a 30° slice of ecliptic longitude starting at 0° Aries.
export function signFromLongitude(lon: number): ZodiacSign {
  return ZODIACS[Math.floor((((lon % 360) + 360) % 360) / 30)];
}

/* ---------- Moon ---------- */

const PHASES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
];

export interface MoonInfo {
  phase: string;
  angle: number;         // 0 = new, 180 = full
  illumination: number;  // 0..1
  sign: ZodiacSign;
  nextFull: Date;
  nextNew: Date;
}

export function moonInfo(now: Date = new Date()): MoonInfo {
  const angle = A.MoonPhase(now);
  let nextFull: Date | null = null;
  let nextNew: Date | null = null;
  let q = A.SearchMoonQuarter(now);
  while (!nextFull || !nextNew) {
    if (q.quarter === 0 && !nextNew) nextNew = q.time.date;
    if (q.quarter === 2 && !nextFull) nextFull = q.time.date;
    q = A.NextMoonQuarter(q);
  }
  return {
    phase: PHASES[Math.round(angle / 45) % 8],
    angle,
    illumination: A.Illumination(A.Body.Moon, now).phase_fraction,
    sign: signFromLongitude(A.EclipticGeoMoon(now).lon),
    nextFull,
    nextNew,
  };
}

/* ---------- Planet positions ---------- */

export const PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] as const;
export type Planet = (typeof PLANETS)[number];
const DAY = 86_400_000;

/** Tropical longitude (true ecliptic of date), degrees. */
export function longitude(p: Planet, t: Date): number {
  if (p === "Sun") return A.SunPosition(t).elon;
  if (p === "Moon") return A.EclipticGeoMoon(t).lon;
  return A.Ecliptic(A.GeoVector(A.Body[p], t, true)).elon;
}

/** Apparent backward motion along the ecliptic over the next day (handles the 360°→0° wrap). */
export function isRetrograde(p: Planet, t: Date): boolean {
  if (p === "Sun" || p === "Moon") return false;
  const d = longitude(p, new Date(t.getTime() + DAY)) - longitude(p, t);
  return ((d + 540) % 360) - 180 < 0;
}

/* ---------- Retrogrades ---------- */

export interface PlanetStatus {
  name: string;
  sign: ZodiacSign;
  retrograde: boolean;
  until?: Date; // when the current retrograde ends (day precision)
}

export function planetStatuses(now: Date = new Date()): PlanetStatus[] {
  return PLANETS.filter((p) => p !== "Sun" && p !== "Moon").map((body) => {
    const retrograde = isRetrograde(body, now);
    let until: Date | undefined;
    if (retrograde) {
      // ponytail: daily stepping; outer-planet retrogrades last ~5 months, so ≤ 200 cheap steps.
      for (let i = 1; i <= 200; i++) {
        const t = new Date(now.getTime() + i * DAY);
        if (!isRetrograde(body, t)) { until = t; break; }
      }
    }
    return { name: body, sign: signFromLongitude(longitude(body, now)), retrograde, until };
  });
}

/* ---------- Season ---------- */

export interface Season {
  sign: ZodiacSign;
  next: ZodiacSign;
  nextStart: Date;
  daysLeft: number;
}

export function zodiacSeason(now: Date = new Date()): Season {
  const sign = getZodiacFromDate(now);
  const next = ZODIACS[(ZODIACS.indexOf(sign) + 1) % 12];
  const [m, d] = next.start;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let nextStart = new Date(now.getFullYear(), m - 1, d);
  if (nextStart <= today) nextStart = new Date(now.getFullYear() + 1, m - 1, d);
  return { sign, next, nextStart, daysLeft: Math.round((nextStart.getTime() - today.getTime()) / DAY) };
}

/* ---------- Big Three (Sun, Moon, Rising) ---------- */

// UTC offset (ms) of an IANA time zone at a given instant, using the browser's tz database
// (so historical changes, e.g. Nepal's +5:30 → +5:45 in 1986, are handled).
function tzOffset(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const n = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second")) - Math.floor(utcMs / 1000) * 1000;
}

/** Converts a wall-clock time in `timeZone` to a real instant. */
export function zonedToUtc(y: number, mo: number, d: number, h: number, mi: number, timeZone: string): Date {
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  let utc = wall - tzOffset(wall, timeZone);
  utc = wall - tzOffset(utc, timeZone); // second pass settles DST edges
  return new Date(utc);
}

/** Ecliptic longitude of the ascendant (rising point), degrees. */
export function ascendant(t: Date, latDeg: number, lonDeg: number): number {
  const rad = Math.PI / 180;
  const ramc = (A.SiderealTime(t) * 15 + lonDeg) * rad;           // local sidereal time as an angle
  const jc = (t.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * DAY);
  const eps = (23.4392911 - 0.0130042 * jc) * rad;                 // mean obliquity of the ecliptic
  const lat = latDeg * rad;
  const asc = Math.atan2(-Math.cos(ramc), Math.sin(eps) * Math.tan(lat) + Math.cos(eps) * Math.sin(ramc)) / rad + 180;
  return ((asc % 360) + 360) % 360;
}

export interface BigThree {
  sun: ZodiacSign;
  moon: ZodiacSign;
  rising: ZodiacSign | null;    // null when birth time is unknown
  moonUncertain: boolean;       // unknown time and the Moon changed sign that day
}

export function bigThree(
  date: { y: number; m: number; d: number },
  time: { h: number; mi: number } | null,
  place: { lat: number; lon: number; tz: string },
): BigThree {
  const at = (h: number, mi: number) => zonedToUtc(date.y, date.m, date.d, h, mi, place.tz);
  const t = time ? at(time.h, time.mi) : at(12, 0);
  const moonAt = (x: Date) => signFromLongitude(A.EclipticGeoMoon(x).lon);
  const moon = moonAt(t);
  return {
    sun: signFromLongitude(A.SunPosition(t).elon),
    moon,
    rising: time ? signFromLongitude(ascendant(t, place.lat, place.lon)) : null,
    moonUncertain: !time && (moonAt(at(0, 0)) !== moon || moonAt(at(23, 59)) !== moon),
  };
}
