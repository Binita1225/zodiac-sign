import * as A from "astronomy-engine";
import { ZodiacSign } from "@/data/zodiacs";
import { ascendant, isRetrograde, longitude, Planet, PLANETS, signFromLongitude, zonedToUtc } from "@/lib/sky";

export { PLANETS, type Planet };

// Astronomical symbols; U+FE0E asks for text style (♀/♂ have emoji forms).
export const PLANET_GLYPH: Record<Planet, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿︎", Venus: "♀︎", Mars: "♂︎",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

const DAY = 86_400_000;
const norm = (x: number) => ((x % 360) + 360) % 360;

/** "17°42′" — position within the sign. */
export function degreeInSign(lon: number): string {
  const x = norm(lon) % 30;
  const deg = Math.floor(x);
  const min = Math.floor((x - deg) * 60);
  return `${deg}°${String(min).padStart(2, "0")}′`;
}

/* ---------- Natal chart ---------- */

export interface Placement {
  planet: Planet;
  lon: number;
  sign: ZodiacSign;
  house: number | null; // whole-sign house; null without birth time
  retrograde: boolean;
}

export interface NatalChart {
  instant: Date;
  placements: Placement[];
  asc: number | null;
}

export interface BirthData {
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM, or "" when unknown
  city: { name: string; lat: number; lon: number; tz: string };
}

export function natalChart(b: BirthData): NatalChart {
  const [y, m, d] = b.date.split("-").map(Number);
  const t = /^(\d{2}):(\d{2})$/.exec(b.time);
  const instant = zonedToUtc(y, m, d, t ? +t[1] : 12, t ? +t[2] : 0, b.city.tz);
  const asc = t ? ascendant(instant, b.city.lat, b.city.lon) : null;
  const ascSign = asc === null ? 0 : Math.floor(asc / 30);
  return {
    instant,
    asc,
    placements: PLANETS.map((planet) => {
      const lon = longitude(planet, instant);
      return {
        planet,
        lon,
        sign: signFromLongitude(lon),
        // Whole-sign houses: the rising sign is the 1st house, the next sign the 2nd, …
        house: asc === null ? null : ((Math.floor(lon / 30) - ascSign + 12) % 12) + 1,
        retrograde: isRetrograde(planet, instant),
      };
    }),
  };
}

/* ---------- Aspects ---------- */

export const ASPECTS = [
  { name: "conjunction", angle: 0, orb: 8, symbol: "☌", tone: "neutral" },
  { name: "sextile", angle: 60, orb: 4, symbol: "⚹", tone: "easy" },
  { name: "square", angle: 90, orb: 6, symbol: "□", tone: "hard" },
  { name: "trine", angle: 120, orb: 6, symbol: "△", tone: "easy" },
  { name: "opposition", angle: 180, orb: 8, symbol: "☍", tone: "hard" },
] as const;
export type Aspect = (typeof ASPECTS)[number];

export interface AspectHit {
  a: Planet;
  b: Planet;
  aspect: Aspect;
  orb: number; // degrees from exact
}

function aspectBetween(lonA: number, lonB: number, orbScale: number): { aspect: Aspect; orb: number } | null {
  const sep = Math.abs(((lonA - lonB + 540) % 360) - 180); // 0..180
  for (const aspect of ASPECTS) {
    const orb = Math.abs(sep - aspect.angle);
    if (orb <= aspect.orb * orbScale) return { aspect, orb };
  }
  return null;
}

/** Aspects between planets inside one chart. */
export function chartAspects(c: NatalChart): AspectHit[] {
  const out: AspectHit[] = [];
  c.placements.forEach((p, i) =>
    c.placements.slice(i + 1).forEach((q) => {
      const hit = aspectBetween(p.lon, q.lon, 1);
      if (hit) out.push({ a: p.planet, b: q.planet, ...hit });
    }),
  );
  return out.sort((x, y) => x.orb - y.orb);
}

/* ---------- Personal transits ---------- */

const THEME: Record<Planet, string> = {
  Sun: "identity and confidence", Moon: "feelings and comfort", Mercury: "thinking and conversations",
  Venus: "love, beauty and money", Mars: "drive and energy", Jupiter: "growth and luck",
  Saturn: "discipline and responsibility", Uranus: "change and surprises", Neptune: "dreams and intuition",
  Pluto: "deep transformation",
};
const VERB: Record<Aspect["name"], string> = {
  conjunction: "joins", sextile: "opens a door for", square: "challenges", trine: "flows easily with", opposition: "pulls against",
};
const ADVICE: Record<Aspect["name"], string> = {
  conjunction: "A fresh start in this part of life — set an intention.",
  sextile: "A small effort brings a good return. Say yes to the opportunity.",
  square: "Friction now builds strength later. Act, don't stew.",
  trine: "This comes naturally today. Lean in and enjoy it.",
  opposition: "Look for balance, not victory. Someone else holds a missing piece.",
};

export interface Transit extends AspectHit {
  headline: string; // "Mars squares your Sun"
  text: string;
  applying: boolean; // getting closer to exact (stronger) vs separating
}

/** Today's planets in aspect to the natal chart, tightest first. */
export function personalTransits(natal: NatalChart, now: Date = new Date(), limit = 4): Transit[] {
  const later = new Date(now.getTime() + DAY / 4);
  const hits: Transit[] = [];
  for (const t of PLANETS) {
    const lon = longitude(t, now);
    for (const n of natal.placements) {
      // Tighter orbs for transits than for a natal chart; the fast Moon gets a little more.
      const hit = aspectBetween(lon, n.lon, t === "Moon" ? 0.6 : 0.4);
      if (!hit) continue;
      const after = aspectBetween(longitude(t, later), n.lon, 1);
      hits.push({
        a: t, b: n.planet, ...hit,
        applying: !!after && after.aspect.name === hit.aspect.name && after.orb < hit.orb,
        headline: `${t} ${VERB[hit.aspect.name]} your ${n.planet}`,
        text: `Today's ${t} (${THEME[t]}) ${VERB[hit.aspect.name]} your natal ${n.planet} (${THEME[n.planet]}). ${ADVICE[hit.aspect.name]}`,
      });
    }
  }
  // Slow planets matter more; weight the orb so a tight Moon aspect doesn't always win.
  const weight = (p: Planet) => (p === "Moon" ? 1.5 : p === "Sun" || p === "Mercury" || p === "Venus" ? 1.2 : 1);
  return hits.sort((x, y) => x.orb * weight(x.a) - y.orb * weight(y.a)).slice(0, limit);
}

/* ---------- Cosmic calendar ---------- */

export interface SkyEvent {
  date: Date;
  kind: "ingress" | "station-retro" | "station-direct" | "full-moon" | "new-moon" | "lunar-eclipse" | "solar-eclipse";
  title: string;
  sign?: ZodiacSign;
  planet?: Planet;
}

const INGRESS_PLANETS: Planet[] = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const STATION_PLANETS: Planet[] = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

export function skyEvents(now: Date = new Date(), days = 90): SkyEvent[] {
  const ev: SkyEvent[] = [];
  const end = now.getTime() + days * DAY;

  // ponytail: day-by-day scan (≈1,300 position calls for 90 days, a few ms). Day precision is enough here.
  for (const p of new Set([...INGRESS_PLANETS, ...STATION_PLANETS])) {
    let prevSign = signFromLongitude(longitude(p, now));
    let prevRetro = isRetrograde(p, now);
    for (let i = 1; i <= days; i++) {
      const t = new Date(now.getTime() + i * DAY);
      if (INGRESS_PLANETS.includes(p)) {
        const sign = signFromLongitude(longitude(p, t));
        if (sign !== prevSign) ev.push({ date: t, kind: "ingress", planet: p, sign, title: `${p} enters ${sign.name}` });
        prevSign = sign;
      }
      if (STATION_PLANETS.includes(p)) {
        const retro = isRetrograde(p, t);
        if (retro !== prevRetro) {
          ev.push({ date: t, kind: retro ? "station-retro" : "station-direct", planet: p, sign: signFromLongitude(longitude(p, t)),
                    title: `${p} ${retro ? "turns retrograde" : "turns direct"}` });
        }
        prevRetro = retro;
      }
    }
  }

  for (let q = A.SearchMoonQuarter(now); q.time.date.getTime() < end; q = A.NextMoonQuarter(q)) {
    if (q.quarter !== 0 && q.quarter !== 2) continue;
    const sign = signFromLongitude(A.EclipticGeoMoon(q.time.date).lon);
    const full = q.quarter === 2;
    ev.push({ date: q.time.date, kind: full ? "full-moon" : "new-moon", sign, title: `${full ? "Full" : "New"} Moon in ${sign.name}` });
  }

  // Eclipses are rarer, so look a full year ahead for them.
  const eclipseEnd = now.getTime() + 365 * DAY;
  for (let e = A.SearchLunarEclipse(now); e.peak.date.getTime() < eclipseEnd; e = A.NextLunarEclipse(e.peak)) {
    const sign = signFromLongitude(A.EclipticGeoMoon(e.peak.date).lon);
    ev.push({ date: e.peak.date, kind: "lunar-eclipse", sign, title: `${cap(e.kind)} lunar eclipse in ${sign.name}` });
  }
  for (let e = A.SearchGlobalSolarEclipse(now); e.peak.date.getTime() < eclipseEnd; e = A.NextGlobalSolarEclipse(e.peak)) {
    const sign = signFromLongitude(A.SunPosition(e.peak.date).elon);
    ev.push({ date: e.peak.date, kind: "solar-eclipse", sign, title: `${cap(e.kind)} solar eclipse in ${sign.name}` });
  }

  return ev.sort((a, b) => a.date.getTime() - b.date.getTime());
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
