import { useMemo } from "react";
import { BirthData, natalChart, personalTransits, PLANET_GLYPH } from "@/lib/chart";

// Personal transits: today's real sky against the user's birth chart.
// Loaded lazily (astronomy library). Rendered inside the "today" section in Index.
export default function YourDay({ birth }: { birth: BirthData | null }) {
  const transits = useMemo(() => (birth ? personalTransits(natalChart(birth)) : []), [birth]);

  if (!birth) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 h-full flex flex-col justify-center">
        <p className="font-mono text-xs text-muted-foreground"><span className="tok-com">// </span>personal transits</p>
        <p className="mt-3 text-lg">See how today's real sky touches <span className="text-primary">your</span> birth chart.</p>
        <p className="mt-1 text-sm text-muted-foreground">Add your birth date, time and city once — we'll remember them on this device.</p>
        <a href="#chart" className="btn-ghost mt-5 self-start">Add birth details</a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card/90 p-5 md:p-6 h-full">
      <p className="font-mono text-xs text-muted-foreground"><span className="tok-com">// </span>today's transits to your chart</p>
      {transits.length === 0 ? (
        <p className="mt-4 text-muted-foreground">A quiet sky for you today — no major transits. Good day to catch up and rest.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {transits.map((t) => {
            const tone = t.aspect.tone === "hard" ? "text-destructive" : t.aspect.tone === "easy" ? "tok-str" : "text-primary";
            return (
              <li key={`${t.a}-${t.b}-${t.aspect.name}`} className="flex gap-3">
                <span className={`glyph shrink-0 grid place-items-center w-10 h-10 rounded-lg border border-border bg-background/40 text-lg ${tone}`} aria-hidden>
                  {t.aspect.symbol}
                </span>
                <div className="min-w-0">
                  <p className="font-medium">
                    <span className="glyph text-muted-foreground">{PLANET_GLYPH[t.a]}</span> {t.headline}
                    <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                      {t.orb.toFixed(1)}° · {t.applying ? "building" : "easing"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
