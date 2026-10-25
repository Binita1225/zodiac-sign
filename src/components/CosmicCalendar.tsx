import { useMemo, useState } from "react";
import { Moon, Circle, RotateCcw, ArrowRight, Sun, ArrowRightLeft } from "lucide-react";
import { skyEvents, SkyEvent } from "@/lib/chart";

const ICON: Record<SkyEvent["kind"], React.ReactNode> = {
  "ingress": <ArrowRight className="w-4 h-4" />,
  "station-retro": <RotateCcw className="w-4 h-4 text-destructive" />,
  "station-direct": <ArrowRightLeft className="w-4 h-4 tok-str" />,
  "full-moon": <Circle className="w-4 h-4 fill-current" />,
  "new-moon": <Circle className="w-4 h-4" />,
  "lunar-eclipse": <Moon className="w-4 h-4 text-primary" />,
  "solar-eclipse": <Sun className="w-4 h-4 text-primary" />,
};

// Loaded lazily (astronomy library). The <section> wrapper lives in Index.
export default function CosmicCalendar() {
  const events = useMemo(() => skyEvents(new Date(), 90), []);
  const [all, setAll] = useState(false);
  const shown = all ? events : events.slice(0, 8);

  return (
    <div className="rounded-xl border border-border bg-card/90">
      <ol className="divide-y divide-border">
        {shown.map((e) => {
          const eclipse = e.kind.endsWith("eclipse");
          return (
            <li
              key={`${e.kind}-${e.date.toISOString()}-${e.planet ?? ""}`}
              className="flex items-center gap-4 px-5 py-3"
              style={eclipse ? { background: "linear-gradient(90deg, oklch(var(--primary) / 0.1), transparent 60%)" } : undefined}
            >
              <time dateTime={e.date.toISOString()} className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
                {e.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </time>
              <span className="w-5 shrink-0 grid place-items-center text-muted-foreground" aria-hidden>{ICON[e.kind]}</span>
              <span className={`flex-1 min-w-0 ${eclipse ? "font-medium" : ""}`}>{e.title}</span>
              {e.sign && (
                <span className="glyph shrink-0 text-lg" style={{ color: `hsl(${e.sign.hue} 70% 60%)` }} title={e.sign.name}>
                  {e.sign.symbol}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {events.length > 8 && (
        <button onClick={() => setAll(!all)} className="w-full px-5 py-3 border-t border-border text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-b-xl">
          {all ? "Show less" : `Show all ${events.length} events`}
        </button>
      )}
    </div>
  );
}
