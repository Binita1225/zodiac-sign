import { useState } from "react";
import { Sparkles } from "lucide-react";
import { MAJOR_ARCANA } from "@/data/tarot";
import { rng } from "@/lib/horoscope";
import { localISODate } from "@/lib/utils";

const KEY = "zi-tarot-revealed";

// One Major Arcana card per person per day: same card all day, so no re-rolling.
export default function TarotCard({ seed }: { seed: string }) {
  const today = localISODate();
  const card = MAJOR_ARCANA[Math.floor(rng(`tarot-${today}-${seed}`)() * MAJOR_ARCANA.length)];
  const [flipped, setFlipped] = useState(() => {
    try { return localStorage.getItem(KEY) === today; } catch { return false; }
  });

  const flip = () => {
    setFlipped(true);
    try { localStorage.setItem(KEY, today); } catch { /* */ }
  };

  return (
    <div className="rounded-xl border border-border bg-card/90 p-5 md:p-6 h-full flex flex-col">
      <p className="font-mono text-xs text-muted-foreground"><span className="tok-com">// </span>card of the day</p>

      <div className="mt-4 flex gap-5 items-center flex-1">
        <button
          onClick={flip}
          disabled={flipped}
          aria-label={flipped ? `${card.name}` : "Reveal today's tarot card"}
          className="shrink-0 w-28 h-44 [perspective:800px] focus-ring rounded-lg"
        >
          <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}>
            {/* Back */}
            <div
              className="absolute inset-0 rounded-lg border grid place-items-center overflow-hidden [backface-visibility:hidden] transition-shadow hover:shadow-[0_0_30px_-6px_hsl(var(--h,270)_75%_60%/0.8)]"
              style={{ borderColor: "hsl(var(--h, 270) 70% 60% / 0.55)", background: "radial-gradient(circle at 50% 40%, hsl(var(--h, 270) 60% 45% / 0.45), transparent 70%), oklch(var(--background))" }}
            >
              <div className="absolute inset-0 bg-stars opacity-80" />
              <div className="absolute inset-2 rounded-md border" style={{ borderColor: "hsl(var(--h, 270) 70% 70% / 0.35)" }} />
              <div className="relative grid place-items-center w-14 h-14 rounded-full border motion-safe:animate-pulse-slow" style={{ borderColor: "hsl(var(--h, 270) 70% 70% / 0.6)" }}>
                <Sparkles className="w-6 h-6" style={{ color: "hsl(var(--h, 270) 80% 75%)" }} />
              </div>
            </div>
            {/* Face */}
            <div
              className="absolute inset-0 rounded-lg border p-3 flex flex-col items-center justify-between text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
              style={{ borderColor: "hsl(var(--h, 270) 70% 60% / 0.6)", background: "linear-gradient(160deg, hsl(var(--h, 270) 60% 50% / 0.18), transparent 60%), oklch(var(--background))" }}
            >
              <span className="font-mono text-xs text-muted-foreground">{card.numeral}</span>
              <span className="display text-base leading-tight">{card.name}</span>
              <span className="text-lg" style={{ color: "hsl(var(--h, 270) 70% 65%)" }}>✦</span>
            </div>
          </div>
        </button>

        <div className="min-w-0" aria-live="polite">
          {flipped ? (
            <div className="animate-fade-in">
              <p className="display text-xl">{card.name}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{card.keywords.join(" · ")}</p>
              <p className="mt-3 text-sm leading-relaxed">{card.meaning}</p>
            </div>
          ) : (
            <>
              <p className="text-lg">Your card is waiting.</p>
              <p className="mt-1 text-sm text-muted-foreground">Take a breath, think of a question, then tap the card. One card per day.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
