import { ZodiacKey, ZodiacSign, getZodiacByKey } from "@/data/zodiacs";
import { localISODate } from "@/lib/utils";

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
}

const COLORS = ["Sage", "Sand", "Indigo", "Amber", "Plum", "Slate", "Rose", "Teal", "Ivory", "Ochre", "Cobalt", "Moss"];

// Deterministic pseudo-random based on a string seed (same sign+day = same horoscope).
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}
export function rng(seed: string) {
  let s = hash(seed);
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32; // [0, 1) — never 1, so pick() can't index past the end
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
    "Something you set aside weeks ago asks for a second look. It has ripened while you weren't watching.",
    "The day is generous with small openings. Say yes to the one that feels slightly inconvenient.",
    "Edges soften as the hours pass. Let the morning be messy; the evening will make sense of it.",
    "Your attention is the rarest resource you hold today. Spend it like it costs something.",
    "A conversation lands differently than expected — in a good way. Stay curious about where it leads.",
  ],
  love: [
    "Soften the edges in conversation. A small act of attention carries more weight than grand gestures.",
    "Vulnerability becomes a doorway, not a risk. Speak the quiet thought first.",
    "Connection deepens when you listen for what isn't said.",
    "Choose presence over performance — the right people are already paying attention.",
    "An old warmth resurfaces. Meet it without needing to know where it's going.",
    "Ask one more question than usual. Curiosity reads as care.",
    "Let someone help you today. Receiving is its own kind of intimacy.",
    "Plans matter less than tone. Arrive gently and the evening takes care of itself.",
    "A shared laugh does more repair work than a long talk. Look for the lightness.",
    "Name what you appreciate out loud. It's obvious to you, not to them.",
  ],
  career: [
    "Quiet competence is your edge. Let the work make the argument.",
    "A small structural change unlocks weeks of friction. Look for the bottleneck, not the bottle.",
    "Say less in meetings, write more in documents. Your ideas travel further on paper today.",
    "Edit before you expand. The strongest move is the one you remove.",
    "Finish the unglamorous task first. It's quietly blocking the interesting one.",
    "A question you're afraid sounds naive is the one everyone needs answered. Ask it.",
    "Protect one uninterrupted hour. That's where today's real progress lives.",
    "Credit someone generously. The goodwill compounds faster than you'd think.",
    "Revisit the plan, not the goal. The route needs adjusting; the destination doesn't.",
    "Ship the version that's good enough. Feedback will teach you more than polish.",
  ],
  health: [
    "Sleep is the strategy. Treat rest as the highest-leverage habit you have.",
    "Move slowly and often. Long walks unwind what stretching cannot.",
    "Hydrate, then breathe deeply five times. Reset before you respond.",
    "Eat earlier, screen later. Your body is asking for rhythm, not rules.",
    "Step outside before noon. Daylight sets the tone for the whole evening.",
    "Your shoulders are holding something. Drop them, then notice the difference.",
    "Choose the stairs, the longer path, the extra stretch. Small motion adds up.",
    "A real meal, eaten slowly, does more than any supplement today.",
    "Give your eyes a rest every hour. Look at something far away.",
    "Wind down with something analog tonight — a page, a pen, a quiet room.",
  ],
  oneLiner: [
    "A day for quiet certainty.",
    "Let stillness do the heavy lifting.",
    "Small, deliberate moves outshine grand ones.",
    "Listen twice, speak once.",
    "The signal hides inside the slow.",
    "Today rewards depth over reach.",
    "Choose presence — the rest follows.",
    "Begin before you feel ready.",
    "Lightness is a form of strength.",
    "What you tend to, grows.",
    "Fewer things, done fully.",
    "Let the obvious answer be enough.",
  ],
  week: [
    "The week unfolds in three movements: a slow opening, a clarifying middle, and a confident close. Trust the arc.",
    "An invitation to recalibrate arrives midweek. The first half asks for patience, the second for decision.",
    "Steady momentum builds quietly across the week. By Friday, what felt unclear becomes obvious.",
    "A week of soft pivots. Nothing dramatic — but the small adjustments will matter for months.",
    "Early days favour planning; later days favour action. Don't swap the order.",
    "Someone new shifts your perspective this week. Leave room in your calendar for unplanned conversations.",
    "Energy peaks midweek. Put your hardest task there and keep the weekend gentle.",
    "A loose thread from last month finally ties off. Use the freed-up space deliberately.",
  ],
};

// Element-flavoured lines mixed into the general reading pool.
const ELEMENT_GENERAL: Record<ZodiacSign["element"], string[]> = {
  Fire: [
    "Your spark is easy to see today. Aim it at one thing instead of five.",
    "Impatience is just energy without direction. Give it a target and it becomes drive.",
    "Lead by going first, not by going loudest. Others will follow the example.",
    "Something you've been circling is ready for a bold, simple move.",
  ],
  Earth: [
    "Steady hands win today. Build the thing a little each hour rather than all at once.",
    "Your practicality is a gift — offer it to someone who's stuck in theory.",
    "Ground yourself in routine, then allow one small indulgence. Balance is the point.",
    "A tangible result arrives from patient work. Let yourself feel it before moving on.",
  ],
  Air: [
    "Ideas arrive faster than you can hold them. Write them down; choose later.",
    "A conversation reshapes your thinking. Stay light enough to change your mind.",
    "Connect two people who should know each other. The ripple comes back to you.",
    "Your clarity cuts through someone else's confusion today. Share it kindly.",
  ],
  Water: [
    "Your intuition reads the room before anyone speaks. Trust that first impression.",
    "Feelings move through quickly today. Let them pass rather than holding on.",
    "Create a little privacy for yourself. Depth needs a quiet container.",
    "Empathy is your strength — just make sure you're on the list of people you care for.",
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
  "Put your phone in another room for an hour.",
  "Tidy one surface. Only one.",
  "Thank someone who won't expect it.",
  "Go to bed twenty minutes earlier.",
];

export function getCosmicAdvice(seed?: string): string {
  if (seed) {
    const r = rng(seed);
    return pick(ADVICE, r);
  }
  return ADVICE[Math.floor(Math.random() * ADVICE.length)];
}

export function getHoroscope(sign: ZodiacKey, period: Period, now: Date = new Date()): Horoscope {
  const z = getZodiacByKey(sign);
  const day = new Date(now);
  if (period === "tomorrow") day.setDate(day.getDate() + 1);
  const r = rng(`${z.key}-${period}-${localISODate(day)}`);

  return {
    general: period === "week"
      ? pick(TEMPLATES.week, r)
      : pick([...TEMPLATES.general, ...ELEMENT_GENERAL[z.element]], r),
    love:    pick(TEMPLATES.love, r),
    career:  pick(TEMPLATES.career, r),
    health:  pick(TEMPLATES.health, r),
    luckyNumber: 1 + Math.floor(r() * 99),
    luckyColor: pick(COLORS, r),
    mood: 35 + Math.floor(r() * 60),
    date: period === "week"
      ? `Week of ${day.toLocaleDateString(undefined, { month: "long", day: "numeric" })}`
      : day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    oneLiner: pick(TEMPLATES.oneLiner, r),
    energy: {
      focus:   30 + Math.floor(r() * 70),
      emotion: 30 + Math.floor(r() * 70),
      luck:    30 + Math.floor(r() * 70),
      social:  30 + Math.floor(r() * 70),
    },
  };
}

export interface Compatibility {
  score: number;
  note: string;
  love: number;
  friendship: number;
  work: number;
}

export function compatibilityScore(a: ZodiacKey, b: ZodiacKey): Compatibility {
  const za = getZodiacByKey(a);
  const zb = getZodiacByKey(b);

  const sameElement = za.element === zb.element;
  const complement: Record<string, string[]> = {
    Fire: ["Air"], Air: ["Fire"], Water: ["Earth"], Earth: ["Water"],
  };
  const complementary = complement[za.element]?.includes(zb.element);

  let base: number;
  if (a === b) base = 78;
  else if (sameElement) base = 82;
  else if (complementary) base = 88;
  else base = 58;

  // Order-independent seed so A×B and B×A score the same.
  const r = rng([a, b].sort().join("-"));
  const score = Math.max(20, Math.min(98, Math.round(base + (r() - 0.5) * 18)));

  const note =
    score >= 85 ? "A rare resonance — instinctive understanding and shared rhythm."
    : score >= 70 ? "Strong alignment with productive contrast. Long-term potential."
    : score >= 55 ? "Workable chemistry — needs intention and clear communication."
    : "Real differences. Possible with patience and curiosity.";

  // Breakdown: each area wobbles around the overall score (same seed, so still symmetric).
  const area = () => Math.max(20, Math.min(99, Math.round(score + (r() - 0.5) * 24)));
  return { score, note, love: area(), friendship: area(), work: area() };
}
