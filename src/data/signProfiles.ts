import { ZodiacKey, ZodiacSign } from "./zodiacs";

export interface SignProfile {
  ruler: string;
  modality: "Cardinal" | "Fixed" | "Mutable";
  luckyDay: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  famous: string[];
}

export const PROFILES: Record<ZodiacKey, SignProfile> = {
  aries: {
    ruler: "Mars", modality: "Cardinal", luckyDay: "Tuesday",
    summary: "The first sign: bold, quick to act and happiest when there's something to start or win.",
    strengths: ["Courageous", "Energetic", "Direct", "Optimistic"],
    weaknesses: ["Impatient", "Impulsive", "Short-tempered"],
    famous: ["Lady Gaga", "Elton John", "Emma Watson"],
  },
  taurus: {
    ruler: "Venus", modality: "Fixed", luckyDay: "Friday",
    summary: "Grounded and sensual, Taurus builds slowly and keeps what it builds.",
    strengths: ["Reliable", "Patient", "Loyal", "Practical"],
    weaknesses: ["Stubborn", "Possessive", "Resistant to change"],
    famous: ["Adele", "Dwayne Johnson", "David Beckham"],
  },
  gemini: {
    ruler: "Mercury", modality: "Mutable", luckyDay: "Wednesday",
    summary: "Curious and quick-witted, Gemini collects ideas, people and conversations.",
    strengths: ["Adaptable", "Witty", "Curious", "Sociable"],
    weaknesses: ["Restless", "Indecisive", "Inconsistent"],
    famous: ["Marilyn Monroe", "Angelina Jolie", "Kanye West"],
  },
  cancer: {
    ruler: "Moon", modality: "Cardinal", luckyDay: "Monday",
    summary: "Protective and deeply feeling, Cancer makes a home wherever it cares.",
    strengths: ["Caring", "Intuitive", "Loyal", "Imaginative"],
    weaknesses: ["Moody", "Over-sensitive", "Holds on too long"],
    famous: ["Tom Hanks", "Princess Diana", "Selena Gomez"],
  },
  leo: {
    ruler: "Sun", modality: "Fixed", luckyDay: "Sunday",
    summary: "Warm, generous and made for the spotlight, Leo leads with heart.",
    strengths: ["Confident", "Generous", "Creative", "Warm-hearted"],
    weaknesses: ["Proud", "Stubborn", "Needs recognition"],
    famous: ["Barack Obama", "Jennifer Lopez", "Madonna"],
  },
  virgo: {
    ruler: "Mercury", modality: "Mutable", luckyDay: "Wednesday",
    summary: "Precise and helpful, Virgo notices the details everyone else misses.",
    strengths: ["Analytical", "Hardworking", "Kind", "Practical"],
    weaknesses: ["Overcritical", "Worrying", "Perfectionist"],
    famous: ["Beyoncé", "Keanu Reeves", "Zendaya"],
  },
  libra: {
    ruler: "Venus", modality: "Cardinal", luckyDay: "Friday",
    summary: "Charming and fair-minded, Libra seeks balance, beauty and partnership.",
    strengths: ["Diplomatic", "Gracious", "Fair", "Social"],
    weaknesses: ["Indecisive", "Avoids conflict", "People-pleasing"],
    famous: ["Will Smith", "Serena Williams", "Kim Kardashian"],
  },
  scorpio: {
    ruler: "Pluto (traditionally Mars)", modality: "Fixed", luckyDay: "Tuesday",
    summary: "Intense and perceptive, Scorpio goes deep — in love, in work, in everything.",
    strengths: ["Passionate", "Resourceful", "Brave", "Loyal"],
    weaknesses: ["Jealous", "Secretive", "Holds grudges"],
    famous: ["Leonardo DiCaprio", "Drake", "Bill Gates"],
  },
  sagittarius: {
    ruler: "Jupiter", modality: "Mutable", luckyDay: "Thursday",
    summary: "Free-spirited and philosophical, Sagittarius is always chasing the next horizon.",
    strengths: ["Optimistic", "Adventurous", "Honest", "Funny"],
    weaknesses: ["Impatient", "Tactless", "Overpromises"],
    famous: ["Taylor Swift", "Brad Pitt", "Billie Eilish"],
  },
  capricorn: {
    ruler: "Saturn", modality: "Cardinal", luckyDay: "Saturday",
    summary: "Disciplined and ambitious, Capricorn plays the long game — and wins it.",
    strengths: ["Responsible", "Disciplined", "Ambitious", "Patient"],
    weaknesses: ["Rigid", "Pessimistic", "Workaholic"],
    famous: ["Michelle Obama", "Denzel Washington", "Elvis Presley"],
  },
  aquarius: {
    ruler: "Uranus (traditionally Saturn)", modality: "Fixed", luckyDay: "Saturday",
    summary: "Original and independent, Aquarius thinks ahead of its time.",
    strengths: ["Inventive", "Independent", "Humanitarian", "Open-minded"],
    weaknesses: ["Detached", "Contrarian", "Unpredictable"],
    famous: ["Oprah Winfrey", "Cristiano Ronaldo", "Harry Styles"],
  },
  pisces: {
    ruler: "Neptune (traditionally Jupiter)", modality: "Mutable", luckyDay: "Thursday",
    summary: "Dreamy and compassionate, Pisces feels everything and imagines even more.",
    strengths: ["Compassionate", "Artistic", "Intuitive", "Gentle"],
    weaknesses: ["Escapist", "Over-trusting", "Easily overwhelmed"],
    famous: ["Rihanna", "Albert Einstein", "Justin Bieber"],
  },
};

type Element = ZodiacSign["element"];

// Why two elements click (or clash). Keyed by the pair in alphabetical order.
const ELEMENT_NOTES: Record<string, string> = {
  "Fire+Fire": "Two flames: big energy, big passion — and the occasional blaze.",
  "Earth+Fire": "Fire brings spark, Earth brings staying power. Different speeds, real potential.",
  "Air+Fire": "Air fans the flame: lively, inspiring and rarely boring.",
  "Fire+Water": "Steam: intense chemistry, but feelings and impulses can collide.",
  "Earth+Earth": "Solid ground: shared values, steady loyalty, a quietly strong bond.",
  "Air+Earth": "Ideas meet practicality. Works when each respects the other's pace.",
  "Earth+Water": "Water nourishes Earth: caring, secure and deeply supportive.",
  "Air+Air": "A meeting of minds: endless conversation and a light, easy connection.",
  "Air+Water": "Head meets heart. Fascinating, but needs patience to understand each other.",
  "Water+Water": "Deep waters: profound empathy and emotional understanding.",
};

export function elementNote(a: Element, b: Element): string {
  return ELEMENT_NOTES[[a, b].sort().join("+")];
}
