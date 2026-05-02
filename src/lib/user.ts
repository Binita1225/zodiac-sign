import { ZodiacKey } from "@/data/zodiacs";

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
  try { return (localStorage.getItem(LAST_SIGN_KEY) as ZodiacKey | null) || null; } catch { return null; }
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
