import Constellation from "./Constellation";
import { spotlight } from "@/lib/utils";
import { useMemo } from "react";
import { ZODIACS, ZodiacSign } from "@/data/zodiacs";
import { PROFILES } from "@/data/signProfiles";
import { compatibilityScore } from "@/lib/horoscope";

export default function SignProfile({ sign }: { sign: ZodiacSign }) {
  const p = PROFILES[sign.key];
  const accent = `hsl(${sign.hue} 70% 60%)`;

  // Ranked with the same scores the compatibility tool shows, so they never disagree.
  const ranked = useMemo(
    () => ZODIACS.filter((z) => z.key !== sign.key)
      .map((z) => ({ z, score: compatibilityScore(sign.key, z.key).score }))
      .sort((a, b) => b.score - a.score),
    [sign.key],
  );
  const best = ranked.slice(0, 3);
  const hardest = ranked[ranked.length - 1];

  const facts = [
    ["element", sign.element],
    ["modality", p.modality],
    ["ruling planet", p.ruler],
    ["lucky day", p.luckyDay],
  ];

  return (
    <div key={sign.key} className="grid lg:grid-cols-[1.3fr_1fr] gap-4 animate-fade-in">
      <div onPointerMove={spotlight} className="spotlight card-hue overflow-hidden rounded-xl border border-border bg-card/90 p-5 md:p-6" style={{ "--h": sign.hue } as React.CSSProperties}>
        <Constellation sign={sign.key} className="absolute -right-6 -top-6 -z-10 w-56 h-56 opacity-60 pointer-events-none" />
        <div className="flex items-center gap-4">
          <span className="glyph text-5xl" style={{ color: accent }}>{sign.symbol}</span>
          <div>
            <h3 className="display text-2xl">{sign.name} <span className="text-muted-foreground font-normal text-lg">· {sign.tagline}</span></h3>
            <p className="text-sm text-muted-foreground">{sign.dates}</p>
          </div>
        </div>
        <p className="mt-4 text-lg leading-relaxed">{p.summary}</p>

        <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {facts.map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-background/40 px-3 py-2">
              <dt className="font-mono text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <TraitList title="strengths" items={p.strengths} className="tok-str" mark="+" />
          <TraitList title="watch out for" items={p.weaknesses} className="text-destructive" mark="−" />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-xl border border-border bg-card/90 p-5 md:p-6">
          <p className="font-mono text-xs text-muted-foreground"><span className="tok-com">// </span>best matches</p>
          <ul className="mt-3 space-y-2">
            {best.map(({ z, score }) => (
              <li key={z.key} className="flex items-center justify-between">
                <span><span className="glyph" style={{ color: `hsl(${z.hue} 70% 60%)` }}>{z.symbol}</span> {z.name}</span>
                <span className="font-mono text-sm text-muted-foreground tabular-nums">{score}/100</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-xs text-muted-foreground"><span className="tok-com">// </span>most challenging</p>
          <p className="mt-2 flex items-center justify-between">
            <span><span className="glyph" style={{ color: `hsl(${hardest.z.hue} 70% 60%)` }}>{hardest.z.symbol}</span> {hardest.z.name}</span>
            <span className="font-mono text-sm text-muted-foreground tabular-nums">{hardest.score}/100</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card/90 p-5 md:p-6">
          <p className="font-mono text-xs text-muted-foreground"><span className="tok-com">// </span>famous {sign.name}s</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {p.famous.map((f) => (
              <li key={f} className="text-sm px-3 py-1 rounded-md border border-border bg-background/40">{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TraitList({ title, items, className, mark }: { title: string; items: string[]; className: string; mark: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-muted-foreground"><span className="tok-com">// </span>{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((s) => (
          <li key={s} className="text-sm"><span className={`font-mono ${className}`}>{mark}</span> {s}</li>
        ))}
      </ul>
    </div>
  );
}
