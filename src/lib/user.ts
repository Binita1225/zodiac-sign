import { ZODIACS, ZodiacKey } from "@/data/zodiacs";
import { localISODate, parseLocalDate } from "@/lib/utils";
import type { BirthData } from "@/lib/chart";
import { CITIES } from "@/data/cities";

const NAME_KEY = "zi-user-name";
const LAST_SIGN_KEY = "zi-last-sign";
const VISITED_KEY = "zi-visited";

export function getUserName(): string {
  try { return localStorage.getItem(NAME_KEY) || ""; } catch { return ""; }
}
export function setUserName(name: string) {
  try { localStorage.setItem(NAME_KEY, name.trim().slice(0, 40)); } catch { /* */ }
}
export function clearUserName() {
  try { localStorage.removeItem(NAME_KEY); } catch { /* */ }
}

export function getLastSign(): ZodiacKey | null {
  try {
    const v = localStorage.getItem(LAST_SIGN_KEY);
    return ZODIACS.some((z) => z.key === v) ? (v as ZodiacKey) : null;
  } catch { return null; }
}
export function setLastSign(key: ZodiacKey) {
  try { localStorage.setItem(LAST_SIGN_KEY, key); } catch { /* */ }
}

export function hasVisited(): boolean {
  try { return localStorage.getItem(VISITED_KEY) === "1"; } catch { return false; }
}
export function markVisited() {
  try { localStorage.setItem(VISITED_KEY, "1"); } catch { /* */ }
}

export function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Good night";
}

const DOB_KEY = "zi-dob";
const STREAK_KEY = "zi-streak";

// Stored only in this browser, so returning visitors keep their birthday insights.
export function getDob(): string {
  try { return localStorage.getItem(DOB_KEY) || ""; } catch { return ""; }
}
export function setDob(v: string) {
  try { if (v) localStorage.setItem(DOB_KEY, v); else localStorage.removeItem(DOB_KEY); } catch { /* */ }
}

/** Records today's visit and returns the consecutive-day streak (1 = first day). */
export function touchStreak(today: string = localISODate()): number {
  try {
    const prev = JSON.parse(localStorage.getItem(STREAK_KEY) || "null") as { last?: string; count?: number } | null;
    const prevCount = Number.isFinite(prev?.count) ? prev!.count! : 0;
    const y = parseLocalDate(today)!;
    y.setDate(y.getDate() - 1); // calendar day, not "now − 24h" (DST-safe)
    let count = 1;
    if (prev?.last === today) count = Math.max(1, prevCount);
    else if (prev?.last === localISODate(y)) count = prevCount + 1;
    localStorage.setItem(STREAK_KEY, JSON.stringify({ last: today, count }));
    return count;
  } catch {
    return 1;
  }
}

const BIRTH_KEY = "zi-birth";

/** Saved birth details (date, time, city) for the chart and personal transits. */
export function getBirth(): BirthData | null {
  try {
    const b = JSON.parse(localStorage.getItem(BIRTH_KEY) || "null") as Partial<BirthData> | null;
    // Re-resolve the city from our own list so stale or edited storage can't feed bad coordinates/time zones.
    const city = CITIES.find((c) => c.name === b?.city?.name);
    if (!b || !city || !parseLocalDate(b.date ?? "") || !/^(\d{2}:\d{2})?$/.test(b.time ?? "x")) return null;
    return { date: b.date!, time: b.time!, city };
  } catch { return null; }
}
export function setBirth(b: BirthData | null) {
  try { if (b) localStorage.setItem(BIRTH_KEY, JSON.stringify(b)); else localStorage.removeItem(BIRTH_KEY); } catch { /* */ }
}
