import { useState } from "react";
import { ZODIACS, ZodiacKey, getZodiacByKey } from "@/data/zodiacs";
import { compatibilityScore } from "@/lib/horoscope";
import { ArrowRight } from "lucide-react";

export default function CompatibilitySection({ initial }: { initial: ZodiacKey }) {
  const [a, setA] = useState<ZodiacKey>(initial);
  const [b, setB] = useState<ZodiacKey>(initial === "leo" ? "aquarius" : "leo");
  const za = getZodiacByKey(a);
  const zb = getZodiacByKey(b);
  const { score, note } = compatibilityScore(a, b);
  const accent = `hsl(${Math.round((za.hue + zb.hue) / 2)} 70% 60%)`;

  return (
    <section id="compatibility" className="surface rounded-3xl p-6 md:p-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Compatibility</div>
          <h2 className="display text-3xl md:text-4xl">Two signs, one resonance</h2>
        </div>
        <div className="text-sm text-muted-foreground max-w-md">
          Choose any pair to see their energetic chemistry across element and temperament.
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-[1fr_auto_1fr_auto] gap-4 md:gap-6 items-center">
        <Picker value={a} onChange={setA} label="Sign A" />
        <ArrowRight className="hidden md:block w-5 h-5 text-muted-foreground mx-auto" />
        <Picker value={b} onChange={setB} label="Sign B" />

        <div className="rounded-2xl border hairline p-6 bg-surface text-center md:text-left">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Resonance</div>
          <div className="display text-5xl mt-1" style={{ color: accent }}>{score}<span className="text-2xl text-muted-foreground">/100</span></div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{note}</p>
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
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</div>
      <div className="relative rounded-2xl border hairline bg-surface p-4 flex items-center gap-3">
        <div className="grid place-items-center w-10 h-10 rounded-full text-lg"
             style={{ background: `${accent}1f`, color: accent }}>{z.symbol}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{z.name}</div>
          <div className="text-xs text-muted-foreground">{z.element} · {z.tagline}</div>
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as ZodiacKey)}
          className="absolute inset-0 opacity-0 cursor-pointer"
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
