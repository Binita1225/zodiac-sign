// The 22 Major Arcana with their traditional upright meanings.
export interface TarotCard {
  numeral: string;
  name: string;
  keywords: string[];
  meaning: string;
}

export const MAJOR_ARCANA: TarotCard[] = [
  { numeral: "0", name: "The Fool", keywords: ["beginnings", "spontaneity", "faith"], meaning: "A fresh start. Take the leap with an open heart — you don't need the whole map to begin." },
  { numeral: "I", name: "The Magician", keywords: ["willpower", "skill", "manifestation"], meaning: "You already have the tools you need. Focus your intention and make something real." },
  { numeral: "II", name: "The High Priestess", keywords: ["intuition", "mystery", "inner voice"], meaning: "The answer is quieter than you think. Trust what you know without being able to explain it." },
  { numeral: "III", name: "The Empress", keywords: ["abundance", "nurture", "creativity"], meaning: "Growth through care. Tend to what you love and let it flourish at its own pace." },
  { numeral: "IV", name: "The Emperor", keywords: ["structure", "authority", "stability"], meaning: "Build the frame. Clear rules and steady leadership turn chaos into progress." },
  { numeral: "V", name: "The Hierophant", keywords: ["tradition", "learning", "guidance"], meaning: "There's wisdom in the tried and true. Seek a mentor or a proven path today." },
  { numeral: "VI", name: "The Lovers", keywords: ["connection", "choice", "values"], meaning: "A meaningful choice about who or what you align with. Choose with your values, not just your wants." },
  { numeral: "VII", name: "The Chariot", keywords: ["determination", "control", "victory"], meaning: "Momentum is yours if you hold the reins. Steer opposing forces toward one goal." },
  { numeral: "VIII", name: "Strength", keywords: ["courage", "patience", "compassion"], meaning: "Gentle strength wins. Meet the hard thing with calm rather than force." },
  { numeral: "IX", name: "The Hermit", keywords: ["reflection", "solitude", "insight"], meaning: "Step back from the noise. Time alone will light the next step." },
  { numeral: "X", name: "Wheel of Fortune", keywords: ["cycles", "change", "luck"], meaning: "The wheel is turning. Adapt to the shift — this cycle is moving in your favour." },
  { numeral: "XI", name: "Justice", keywords: ["fairness", "truth", "cause and effect"], meaning: "Clear and honest choices pay off. Weigh things fairly — including your own needs." },
  { numeral: "XII", name: "The Hanged Man", keywords: ["pause", "surrender", "new perspective"], meaning: "Stuck? Stop pushing. Seeing it from another angle will unlock it." },
  { numeral: "XIII", name: "Death", keywords: ["endings", "transformation", "release"], meaning: "Something is ending so something better can begin. Let it go cleanly." },
  { numeral: "XIV", name: "Temperance", keywords: ["balance", "moderation", "harmony"], meaning: "Blend, don't extremes. The middle path is the fastest one today." },
  { numeral: "XV", name: "The Devil", keywords: ["attachment", "habits", "temptation"], meaning: "Notice what holds you by habit rather than choice. The chain is looser than it looks." },
  { numeral: "XVI", name: "The Tower", keywords: ["upheaval", "revelation", "breakthrough"], meaning: "A sudden shake-up clears what wasn't built to last. Truth arrives, then space." },
  { numeral: "XVII", name: "The Star", keywords: ["hope", "renewal", "inspiration"], meaning: "Healing and hope return. Keep faith in the long view — you're on the right track." },
  { numeral: "XVIII", name: "The Moon", keywords: ["intuition", "uncertainty", "dreams"], meaning: "Not everything is clear yet. Move slowly, trust your instincts and watch your fears." },
  { numeral: "XIX", name: "The Sun", keywords: ["joy", "success", "vitality"], meaning: "Warmth, clarity and success. Let yourself be seen and enjoy the good day." },
  { numeral: "XX", name: "Judgement", keywords: ["awakening", "reflection", "calling"], meaning: "A wake-up call. Review honestly, forgive what's past, answer what's calling you." },
  { numeral: "XXI", name: "The World", keywords: ["completion", "wholeness", "achievement"], meaning: "A cycle completes. Celebrate how far you've come before beginning the next chapter." },
];
