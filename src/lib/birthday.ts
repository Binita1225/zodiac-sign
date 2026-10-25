const BIRTHSTONES = ["Garnet", "Amethyst", "Aquamarine", "Diamond", "Emerald", "Pearl", "Ruby", "Peridot", "Sapphire", "Opal", "Topaz", "Turquoise"];
const FLOWERS = ["Carnation", "Violet", "Daffodil", "Daisy", "Lily of the valley", "Rose", "Larkspur", "Gladiolus", "Aster", "Marigold", "Chrysanthemum", "Narcissus"];
const ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const ELEMENTS = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];

export const LIFE_PATH_MEANINGS: Record<number, string> = {
  1: "The Leader — independent, driven, original.",
  2: "The Peacemaker — gentle, intuitive, cooperative.",
  3: "The Communicator — creative, expressive, social.",
  4: "The Builder — steady, practical, dependable.",
  5: "The Adventurer — curious, restless, free.",
  6: "The Nurturer — caring, responsible, warm.",
  7: "The Seeker — thoughtful, analytical, spiritual.",
  8: "The Achiever — ambitious, capable, strong-willed.",
  9: "The Humanitarian — compassionate, wise, generous.",
  11: "Master number: The Intuitive — inspired, sensitive, visionary.",
  22: "Master number: The Master Builder — turns big dreams into reality.",
  33: "Master number: The Master Teacher — devoted, uplifting, selfless.",
};

const DAY = 86_400_000;

function reduce(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((s, c) => s + Number(c), 0);
  }
  return n;
}

/** Life path: reduce month, day and year separately, then the total (keeping 11/22/33). */
export function lifePath(d: Date): number {
  return reduce(reduce(d.getMonth() + 1) + reduce(d.getDate()) + reduce(d.getFullYear()));
}

/** Chinese zodiac year — starts at Lunar New Year, not 1 January. */
export function chineseZodiac(d: Date): { animal: string; element: string } {
  let year = d.getFullYear();
  try {
    const rel = new Intl.DateTimeFormat("en-u-ca-chinese", { year: "numeric" })
      .formatToParts(d)
      .find((p) => (p.type as string) === "relatedYear"); // not in TS's lib types yet
    if (rel) year = Number(rel.value);
  } catch {
    // ponytail: without Intl Chinese-calendar support, Jan/early-Feb births may be one year off.
  }
  return { animal: ANIMALS[(((year - 4) % 12) + 12) % 12], element: ELEMENTS[(((year - 4) % 10) + 10) % 10] };
}

export interface BirthdayInfo {
  age: number;
  weekday: string;
  daysToBirthday: number; // 0 = today
  birthstone: string;
  flower: string;
  lifePath: number;
  chinese: { animal: string; element: string };
}

export function birthdayInfo(dob: Date, now: Date = new Date()): BirthdayInfo {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // 29 Feb birthdays are celebrated on 28 Feb in non-leap years.
  const nextOn = (y: number) => {
    const b = new Date(y, dob.getMonth(), dob.getDate());
    return b.getMonth() === dob.getMonth() ? b : new Date(y, 1, 28);
  };
  let next = nextOn(today.getFullYear());
  if (next < today) next = nextOn(today.getFullYear() + 1);
  const hadBirthdayThisYear = nextOn(today.getFullYear()) <= today;

  return {
    age: today.getFullYear() - dob.getFullYear() - (hadBirthdayThisYear ? 0 : 1),
    weekday: dob.toLocaleDateString("en-US", { weekday: "long" }),
    daysToBirthday: Math.round((next.getTime() - today.getTime()) / DAY),
    birthstone: BIRTHSTONES[dob.getMonth()],
    flower: FLOWERS[dob.getMonth()],
    lifePath: lifePath(dob),
    chinese: chineseZodiac(dob),
  };
}
