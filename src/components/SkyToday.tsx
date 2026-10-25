import { spotlight } from "@/lib/utils";
import Constellation from "./Constellation";
import MoonRender from "./MoonRender";
import { useMemo } from "react";
import { moonInfo, planetStatuses, zodiacSeason } from "@/lib/sky";

const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
const accentOf = (hue: number) => `hsl(${hue} 70% 60%)`;

// Loaded lazily (pulls in the astronomy library). The <section> wrapper lives in Index.
export default function SkyToday() {
  const { season, moon, planets } = useMemo(() => {
    const now = new Date();
    return { season: zodiacSeason(now), moon: moonInfo(now), planets: planetStatuses(now) };
  }, []);
  const mercury = planets.find((p) => p.name === "Mercury")!;
  const retro = planets.filter((p) => p.retrograde);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Season */}
      <Card label="season" hue={season.sign.hue}>
        <Constellation sign={season.sign.key} className="absolute -right-4 -top-2 -z-10 w-40 h-40 opacity-70 pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <span className="glyph text-5xl" style={{ color: accentOf(season.sign.hue) }}>{season.sign.symbol}</span>
          <div>
            <div className="display text-2xl">{season.sign.name} season</div>
            <div className="text-sm text-muted-foreground">{season.sign.dates}</div>
          </div>
        </div>
        <p className="relative mt-5 text-sm text-muted-foreground">
          <span className="glyph" style={{ color: accentOf(season.next.hue) }}>{season.next.symbol}</span>{" "}
          <span className="text-foreground">{season.next.name}</span> season starts in{" "}
          <span className="text-foreground font-medium tabular-nums">{season.daysLeft} {season.daysLeft === 1 ? "day" : "days"}</span>{" "}
          · {fmt(season.nextStart)}
        </p>
      </Card>

      {/* Moon */}
      <Card label="moon">
        <div className="flex items-center gap-4">
          <MoonRender angle={moon.angle} className="w-28 h-28 shrink-0 -my-4 -ml-3" />
          <div>
            <div className="display text-2xl">{moon.phase}</div>
            <div className="text-sm text-muted-foreground">
              {Math.round(moon.illumination * 100)}% lit · Moon in{" "}
              <span className="text-foreground"><span className="glyph">{moon.sign.symbol}</span> {moon.sign.name}</span>
            </div>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
            <dt className="font-mono text-xs text-muted-foreground">next full</dt>
            <dd className="mt-0.5">{fmt(moon.nextFull)}</dd>
          </div>
          <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
            <dt className="font-mono text-xs text-muted-foreground">next new</dt>
            <dd className="mt-0.5">{fmt(moon.nextNew)}</dd>
          </div>
        </dl>
      </Card>

      {/* Retrogrades */}
      <Card label="retrogrades">
        <div className="display text-2xl">
          {mercury.retrograde ? "Mercury is retrograde" : "Mercury is direct"}
        </div>
        <div className="text-sm text-muted-foreground">
          {mercury.retrograde && mercury.until
            ? `Until ${fmt(mercury.until)} — double-check plans and messages.`
            : retro.length === 0 ? "No planets retrograde right now." : `${retro.length} planet${retro.length > 1 ? "s" : ""} retrograde right now.`}
        </div>
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {planets.map((p) => (
            <li key={p.name} className="flex items-center justify-between gap-2">
              <span className="truncate">
                {p.name} <span className="glyph text-muted-foreground" title={p.sign.name}>{p.sign.symbol}</span>
              </span>
              {p.retrograde ? (
                <span className="font-mono text-[11px] px-1.5 rounded bg-destructive/15 text-destructive whitespace-nowrap" title={p.until ? `Retrograde until ${fmt(p.until)}` : "Retrograde"}>
                  Rx{p.until ? ` → ${fmt(p.until)}` : ""}
                </span>
              ) : (
                <span className="font-mono text-[11px] tok-str">direct</span>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Card({ label, hue, children }: { label: string; hue?: number; children: React.ReactNode }) {
  return (
    <div
      onPointerMove={spotlight}
      className="relative overflow-hidden spotlight card-hue rounded-xl border border-border bg-card/90 p-5 md:p-6"
      style={hue === undefined ? undefined : ({ "--h": hue } as React.CSSProperties)}
    >
      <p className="font-mono text-xs text-muted-foreground mb-4"><span className="tok-com">// </span>{label}</p>
      {children}
    </div>
  );
}
