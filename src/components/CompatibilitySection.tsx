import { useState } from "react";
import { ZODIACS, ZodiacKey, getZodiacByKey } from "@/data/zodiacs";
import { compatibilityScore } from "@/lib/horoscope";
import { elementNote } from "@/data/signProfiles";
import { ArrowRight, Heart, Users, Briefcase, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function CompatibilitySection({ initial }: { initial: readonly [ZodiacKey, ZodiacKey] }) {
  const [a, setA] = useState<ZodiacKey>(initial[0]);
  const [b, setB] = useState<ZodiacKey>(initial[1]);
  const za = getZodiacByKey(a);
  const zb = getZodiacByKey(b);
  const { score, note, love, friendship, work } = compatibilityScore(a, b);
  const accent = `hsl(${Math.round((za.hue + zb.hue) / 2)} 70% 60%)`;

  return (
    <section id="compatibility" className="surface rounded-xl p-5 md:p-8 scroll-mt-24">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow mb-2"><span className="tok-str">$</span> compare --signs a b</p>
          <h2 className="display text-3xl md:text-4xl">Two signs, one resonance</h2>
        </div>
        <div className="text-sm text-muted-foreground max-w-md">
          Choose any pair to see their energetic chemistry across element and temperament.
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-end">
        <Picker value={a} onChange={setA} label="Sign A" />
        <ArrowRight className="hidden md:block w-5 h-5 text-muted-foreground mx-auto mb-7" />
        <Picker value={b} onChange={setB} label="Sign B" />
      </div>

      <div className="mt-4 grid md:grid-cols-[1fr_1.4fr] gap-4">
        <div className="rounded-xl border hairline p-6 bg-surface">
          <div className="font-mono text-xs text-muted-foreground">overall</div>
          <div className="display text-5xl mt-1" style={{ color: accent }}>{score}<span className="text-2xl text-muted-foreground">/100</span></div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{note}</p>
          <p className="text-sm mt-3 leading-relaxed">
            <span className="font-mono text-xs text-muted-foreground block mb-1">{za.element} + {zb.element}</span>
            {elementNote(za.element, zb.element)}
          </p>
        </div>

        <div className="rounded-xl border hairline p-6 bg-surface flex flex-col gap-5">
          <Bar icon={<Heart className="w-4 h-4" />} label="Love" value={love} accent={accent} />
          <Bar icon={<Users className="w-4 h-4" />} label="Friendship" value={friendship} accent={accent} />
          <Bar icon={<Briefcase className="w-4 h-4" />} label="Work" value={work} accent={accent} />
          <button
            onClick={() => share(`${za.name} × ${zb.name}: ${score}/100 — love ${love}, friendship ${friendship}, work ${work}. ${elementNote(za.element, zb.element)}`, `${window.location.origin}/?match=${a},${b}`)}
            className="mt-auto self-start inline-flex items-center gap-2 h-10 px-4 rounded-md border hairline hover:bg-accent text-sm transition-colors focus-ring"
          >
            <Share2 className="w-4 h-4" />
            Share this match
          </button>
        </div>
      </div>
    </section>
  );
}

function Picker({ value, onChange, label }: { value: ZodiacKey; onChange: (v: ZodiacKey) => void; label: string }) {
  const z = getZodiacByKey(value);
  const accent = `hsl(${z.hue} 70% 60%)`;
  return (
    <label className="block">
      <div className="font-mono text-xs text-muted-foreground mb-2">{label.toLowerCase()}</div>
      <div className="relative card-lift rounded-xl border hairline bg-surface p-4 flex items-center gap-3 focus-within:border-primary">
        <div className="glyph grid place-items-center w-10 h-10 rounded-full text-lg"
             style={{ background: `${accent}1f`, color: accent }}>{z.symbol}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{z.name}</div>
          <div className="text-xs text-muted-foreground">{z.element} · {z.tagline}</div>
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as ZodiacKey)}
          className="absolute inset-0 opacity-0 cursor-pointer text-base"
          aria-label={label}
        >
          {ZODIACS.map((s) => (
            <option key={s.key} value={s.key}>{s.name}</option>
          ))}
        </select>
      </div>
    </label>
  );
}

async function share(text: string, url: string) {
  try {
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      await navigator.share({ text, url });
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Match copied to clipboard");
    }
  } catch (e) {
    if ((e as Error).name !== "AbortError") toast.error("Couldn't share. Try again.");
  }
}

function Bar({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="flex items-center gap-2 text-muted-foreground">{icon}{label}</span>
        <span className="font-mono tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${value}%`, background: accent }} />
      </div>
    </div>
  );
}
