export type ZodiacKey =
  | "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo"
  | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";

export interface ZodiacSign {
  key: ZodiacKey;
  name: string;
  symbol: string;        // unicode glyph
  element: "Fire" | "Earth" | "Air" | "Water";
  dates: string;         // human readable
  start: [number, number]; // [month, day] inclusive
  end: [number, number];   // [month, day] inclusive
  hue: number;           // base hue for accent
  tagline: string;
}

// Hues chosen for soft pastel accents that work in light & dark mode.
export const ZODIACS: ZodiacSign[] = [
  { key: "aries",       name: "Aries",       symbol: "♈", element: "Fire",  dates: "Mar 21 – Apr 19", start: [3,21], end: [4,19],  hue: 8,   tagline: "The Initiator" },
  { key: "taurus",      name: "Taurus",      symbol: "♉", element: "Earth", dates: "Apr 20 – May 20", start: [4,20], end: [5,20],  hue: 140, tagline: "The Builder" },
  { key: "gemini",      name: "Gemini",      symbol: "♊", element: "Air",   dates: "May 21 – Jun 20", start: [5,21], end: [6,20],  hue: 48,  tagline: "The Messenger" },
  { key: "cancer",      name: "Cancer",      symbol: "♋", element: "Water", dates: "Jun 21 – Jul 22", start: [6,21], end: [7,22],  hue: 200, tagline: "The Nurturer" },
  { key: "leo",         name: "Leo",         symbol: "♌", element: "Fire",  dates: "Jul 23 – Aug 22", start: [7,23], end: [8,22],  hue: 28,  tagline: "The Sovereign" },
  { key: "virgo",       name: "Virgo",       symbol: "♍", element: "Earth", dates: "Aug 23 – Sep 22", start: [8,23], end: [9,22],  hue: 90,  tagline: "The Analyst" },
  { key: "libra",       name: "Libra",       symbol: "♎", element: "Air",   dates: "Sep 23 – Oct 22", start: [9,23], end: [10,22], hue: 330, tagline: "The Diplomat" },
  { key: "scorpio",     name: "Scorpio",     symbol: "♏", element: "Water", dates: "Oct 23 – Nov 21", start: [10,23],end: [11,21], hue: 280, tagline: "The Alchemist" },
  { key: "sagittarius", name: "Sagittarius", symbol: "♐", element: "Fire",  dates: "Nov 22 – Dec 21", start: [11,22],end: [12,21], hue: 18,  tagline: "The Seeker" },
  { key: "capricorn",   name: "Capricorn",   symbol: "♑", element: "Earth", dates: "Dec 22 – Jan 19", start: [12,22],end: [1,19],  hue: 220, tagline: "The Architect" },
  { key: "aquarius",    name: "Aquarius",    symbol: "♒", element: "Air",   dates: "Jan 20 – Feb 18", start: [1,20], end: [2,18],  hue: 190, tagline: "The Visionary" },
  { key: "pisces",      name: "Pisces",      symbol: "♓", element: "Water", dates: "Feb 19 – Mar 20", start: [2,19], end: [3,20],  hue: 260, tagline: "The Dreamer" },
];

export function getZodiacByKey(key: ZodiacKey): ZodiacSign {
  return ZODIACS.find(z => z.key === key)!;
}

export function getZodiacFromDate(date: Date): ZodiacSign {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  for (const z of ZODIACS) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm === em) {
      if (m === sm && d >= sd && d <= ed) return z;
    } else {
      // crosses year boundary (Capricorn)
      if ((m === sm && d >= sd) || (m === em && d <= ed)) return z;
    }
  }
  return ZODIACS[0];
}
