import { ZodiacKey, getZodiacByKey } from "@/data/zodiacs";

export type Period = "today" | "tomorrow" | "week";

export interface EnergyMetrics {
  focus: number;
  emotion: number;
  luck: number;
  social: number;
}

export interface Horoscope {
  general: string;
  love: string;
  career: string;
  health: string;
  luckyNumber: number;
  luckyColor: string;
  mood: number; // 0..100
  date: string;
  oneLiner: string;
  energy: EnergyMetrics;
  cached?: boolean;
}

const COLORS = ["Sage", "Sand", "Indigo", "Amber", "Plum", "Slate", "Rose", "Teal", "Ivory", "Ochre"];

// Deterministic pseudo-random based on a string seed (same sign+day = same horoscope).
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}
function rng(seed: string) {
  let s = hash(seed);
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

const TEMPLATES = {
  general: [
    "Today invites a quieter rhythm. Notice the subtle shifts in mood and let intention guide your pace.",
    "A clarifying breeze passes through your day. What once felt tangled begins to settle into shape.",
    "An invitation toward focus arrives — choose depth over breadth and the day will reward you.",
    "Trust the slower channel. Insight prefers stillness to spectacle today.",
    "Momentum returns through small disciplined choices. Stack them and watch the day compound.",
  ],
  love: [
    "Soften the edges in conversation. A small act of attention carries more weight than grand gestures.",
    "Vulnerability becomes a doorway, not a risk. Speak the quiet thought first.",
    "Connection deepens when you listen for what isn't said.",
    "Choose presence over performance — the right people are already paying attention.",
  ],
  career: [
    "Quiet competence is your edge. Let the work make the argument.",
    "A small structural change unlocks weeks of friction. Look for the bottleneck, not the bottle.",
    "Say less in meetings, write more in documents. Your ideas travel further on paper today.",
    "Edit before you expand. The strongest move is the one you remove.",
  ],
  health: [
    "Sleep is the strategy. Treat rest as the highest-leverage habit you have.",
    "Move slowly and often. Long walks unwind what stretching cannot.",
    "Hydrate, then breathe deeply five times. Reset before you respond.",
    "Eat earlier, screen later. Your body is asking for rhythm, not rules.",
  ],
  oneLiner: [
    "A day for quiet certainty.",
    "Let stillness do the heavy lifting.",
    "Small, deliberate moves outshine grand ones.",
    "Listen twice, speak once.",
    "The signal hides inside the slow.",
    "Today rewards depth over reach.",
    "Choose presence — the rest follows.",
  ],
  week: [
    "The week unfolds in three movements: a slow opening, a clarifying middle, and a confident close. Trust the arc.",
    "An invitation to recalibrate arrives midweek. The first half asks for patience, the second for decision.",
    "Steady momentum builds quietly across the week. By Friday, what felt unclear becomes obvious.",
    "A week of soft pivots. Nothing dramatic — but the small adjustments will matter for months.",
  ],
};

const ADVICE = [
  "Drink water before you reach for caffeine.",
  "Send the message you've been drafting in your head.",
  "Take the long route home — once.",
  "Close one open loop today. Just one.",
  "Say no to the easy thing.",
  "Write the idea down before it leaves.",
  "Sit with the discomfort for ten more seconds.",
  "Compliment a stranger, quietly.",
  "Read something printed on paper.",
  "Move a meeting to a walk.",
  "Underline a sentence that surprises you.",
  "Leave a margin in your day.",
];

export function getCosmicAdvice(seed?: string): string {
  if (seed) {
    const r = rng(seed);
    return pick(ADVICE, r);
  }
  return ADVICE[Math.floor(Math.random() * ADVICE.length)];
}

const CACHE_PREFIX = "zi-cache-";

function cacheKey(sign: ZodiacKey, period: Period) {
  return `${CACHE_PREFIX}${sign}-${period}`;
}

export function getCached(sign: ZodiacKey, period: Period): Horoscope | null {
  try {
    const raw = localStorage.getItem(cacheKey(sign, period));
    if (!raw) return null;
    return JSON.parse(raw) as Horoscope;
  } catch {
    return null;
  }
}

export async function fetchHoroscope(sign: ZodiacKey, period: Period): Promise<Horoscope> {
  // Simulate network latency for realistic UX
  await new Promise((r) => setTimeout(r, 550 + Math.random() * 350));

  // Simulate occasional failure (5%) — fall back to cache below
  if (Math.random() < 0.05) {
    const cached = getCached(sign, period);
    if (cached) return { ...cached, cached: true };
    throw new Error("network");
  }

  const z = getZodiacByKey(sign);
  const today = new Date();
  if (period === "tomorrow") today.setDate(today.getDate() + 1);
  const seed = `${z.key}-${period}-${today.toISOString().slice(0, 10)}`;
  const r = rng(seed);

  const data: Horoscope = {
    general: period === "week" ? pick(TEMPLATES.week, r) : pick(TEMPLATES.general, r),
    love:    pick(TEMPLATES.love, r),
    career:  pick(TEMPLATES.career, r),
    health:  pick(TEMPLATES.health, r),
    luckyNumber: 1 + Math.floor(r() * 99),
    luckyColor: pick(COLORS, r),
    mood: 35 + Math.floor(r() * 60),
    date: period === "week"
      ? `Week of ${today.toLocaleDateString(undefined, { month: "long", day: "numeric" })}`
      : today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    oneLiner: pick(TEMPLATES.oneLiner, r),
    energy: {
      focus:   30 + Math.floor(r() * 70),
      emotion: 30 + Math.floor(r() * 70),
      luck:    30 + Math.floor(r() * 70),
      social:  30 + Math.floor(r() * 70),
    },
  };

  try {
    localStorage.setItem(cacheKey(sign, period), JSON.stringify(data));
  } catch { /* ignore quota */ }

  return data;
}

export function compatibilityScore(a: ZodiacKey, b: ZodiacKey): { score: number; note: string } {
  const za = getZodiacByKey(a);
  const zb = getZodiacByKey(b);

  const sameElement = za.element === zb.element;
  const complement: Record<string, string[]> = {
    Fire: ["Air"], Air: ["Fire"], Water: ["Earth"], Earth: ["Water"],
  };
  const complementary = complement[za.element]?.includes(zb.element);

  let base = 50;
  if (a === b) base = 78;
  else if (sameElement) base = 82;
  else if (complementary) base = 88;
  else base = 58;

  const r = rng(`${a}-${b}`);
  const score = Math.max(20, Math.min(98, Math.round(base + (r() - 0.5) * 18)));

  const note =
    score >= 85 ? "A rare resonance — instinctive understanding and shared rhythm."
    : score >= 70 ? "Strong alignment with productive contrast. Long-term potential."
    : score >= 55 ? "Workable chemistry — needs intention and clear communication."
    : "Real differences. Possible with patience and curiosity.";

  return { score, note };
}
