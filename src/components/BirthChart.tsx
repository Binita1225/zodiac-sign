import { useMemo } from "react";
import { ZODIACS } from "@/data/zodiacs";
import { BirthData, chartAspects, degreeInSign, natalChart, NatalChart, PLANET_GLYPH } from "@/lib/chart";

const C = 160; // centre of the 320×320 wheel
const R_OUT = 152, R_SIGN = 128, R_PLANET = 98, R_ASPECT = 72;

// Ascendant at 9 o'clock, longitude increasing counter-clockwise (standard chart orientation).
function point(lon: number, start: number, r: number) {
  const a = ((180 + lon - start) * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C - r * Math.sin(a) };
}

export default function BirthChart({ birth }: { birth: BirthData }) {
  const chart = useMemo(() => natalChart(birth), [birth]);
  const aspects = useMemo(() => chartAspects(chart), [chart]);
  const majors = aspects.filter((x) => x.aspect.name !== "conjunction" || x.orb < 5).slice(0, 8);

  return (
    <div className="mt-4 grid lg:grid-cols-[minmax(0,420px)_1fr] gap-4 items-start">
      <div className="rounded-xl border border-border bg-card/90 p-4 md:p-6">
        <p className="font-mono text-xs text-muted-foreground mb-2"><span className="tok-com">// </span>birth chart · {birth.city.name}</p>
        <Wheel chart={chart} aspects={aspects} />
        {chart.asc === null && (
          <p className="mt-2 text-xs text-muted-foreground">Without a birth time the wheel starts at 0° Aries and houses are hidden.</p>
        )}
      </div>

      <div className="grid gap-4">
        <div className="rounded-xl border border-border bg-card/90 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-xs text-muted-foreground border-b border-border">
                <th className="text-left font-normal px-4 py-2.5">planet</th>
                <th className="text-left font-normal px-4 py-2.5">sign</th>
                <th className="text-right font-normal px-4 py-2.5">degree</th>
                {chart.asc !== null && <th className="text-right font-normal px-4 py-2.5">house</th>}
              </tr>
            </thead>
            <tbody>
              {chart.placements.map((p) => (
                <tr key={p.planet} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="glyph inline-block w-5 text-muted-foreground">{PLANET_GLYPH[p.planet]}</span> {p.planet}
                    {p.retrograde && <span className="ml-1.5 font-mono text-[11px] text-destructive" title="Retrograde at birth">Rx</span>}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="glyph" style={{ color: `hsl(${p.sign.hue} 70% 60%)` }}>{p.sign.symbol}</span> {p.sign.name}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums">{degreeInSign(p.lon)}</td>
                  {chart.asc !== null && <td className="px-4 py-2 text-right font-mono tabular-nums">{p.house}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-card/90 p-5">
          <p className="font-mono text-xs text-muted-foreground"><span className="tok-com">// </span>strongest aspects</p>
          <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {majors.map((x) => (
              <li key={`${x.a}-${x.b}`} className="flex items-center justify-between gap-2">
                <span>
                  {x.a} <span className={x.aspect.tone === "hard" ? "text-destructive" : x.aspect.tone === "easy" ? "tok-str" : "text-primary"}>{x.aspect.symbol}</span> {x.b}
                  <span className="text-muted-foreground"> · {x.aspect.name}</span>
                </span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">{x.orb.toFixed(1)}°</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Wheel({ chart, aspects }: { chart: NatalChart; aspects: ReturnType<typeof chartAspects> }) {
  const start = chart.asc ?? 0;

  // Nudge planets that bunch up onto inner tracks so glyphs don't overlap.
  const placed = [...chart.placements].sort((a, b) => a.lon - b.lon).map((p, i, arr) => {
    let track = 0;
    for (let j = i - 1; j >= 0 && p.lon - arr[j].lon < 7; j--) track++;
    return { ...p, r: R_PLANET - (track % 2) * 13 };
  });
  const lonOf = Object.fromEntries(chart.placements.map((p) => [p.planet, p.lon]));

  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[420px] mx-auto" role="img" aria-label="Birth chart wheel">
      <circle cx={C} cy={C} r={R_OUT} className="fill-background/40 stroke-border" />
      <circle cx={C} cy={C} r={R_SIGN - 12} className="fill-none stroke-border" />
      <circle cx={C} cy={C} r={R_ASPECT} className="fill-none stroke-border" />

      {/* Sign segments */}
      {ZODIACS.map((z, i) => {
        const a = point(i * 30, start, R_OUT), b = point(i * 30, start, R_SIGN - 12);
        const g = point(i * 30 + 15, start, R_SIGN + 2);
        return (
          <g key={z.key}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-border" />
            <text x={g.x} y={g.y} textAnchor="middle" dominantBaseline="central" fontSize="15" className="glyph" fill={`hsl(${z.hue} 70% 60%)`}>
              {z.symbol}
            </text>
          </g>
        );
      })}

      {/* Aspect lines */}
      {aspects.filter((x) => x.aspect.name !== "conjunction").map((x) => {
        const p = point(lonOf[x.a], start, R_ASPECT), q = point(lonOf[x.b], start, R_ASPECT);
        const color = x.aspect.tone === "hard" ? "oklch(0.65 0.2 22)" : "oklch(0.75 0.13 165)";
        return <line key={`${x.a}-${x.b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={color} strokeOpacity={0.35 + 0.4 * (1 - x.orb / x.aspect.orb)} strokeWidth="1" />;
      })}

      {/* Ascendant marker */}
      {chart.asc !== null && (
        <text x={C - R_OUT + 4} y={C - 5} fontSize="9" className="fill-primary font-mono">AC</text>
      )}
      {chart.asc !== null && <line x1={C - R_OUT} y1={C} x2={C - R_ASPECT} y2={C} className="stroke-primary" strokeWidth="1.5" />}

      {/* Planets */}
      {placed.map((p) => {
        const tick = point(p.lon, start, R_SIGN - 12), tick2 = point(p.lon, start, R_SIGN - 18);
        const g = point(p.lon, start, p.r);
        return (
          <g key={p.planet}>
            <line x1={tick.x} y1={tick.y} x2={tick2.x} y2={tick2.y} className="stroke-foreground" />
            <text x={g.x} y={g.y} textAnchor="middle" dominantBaseline="central" fontSize="14" className="glyph fill-foreground">
              <title>{`${p.planet} ${degreeInSign(p.lon)} ${p.sign.name}`}</title>
              {PLANET_GLYPH[p.planet]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
