import { useMemo } from "react";
import { Cake } from "lucide-react";
import { birthdayInfo, LIFE_PATH_MEANINGS } from "@/lib/birthday";
import { getZodiacFromDate } from "@/data/zodiacs";

export default function BirthdayInsights({ dob }: { dob: Date }) {
  const info = useMemo(() => birthdayInfo(dob), [dob]);
  const sign = getZodiacFromDate(dob);
  const accent = `hsl(${sign.hue} 70% 60%)`;

  const tiles: { label: string; value: React.ReactNode; sub?: string }[] = [
    { label: "sun sign", value: <><span className="glyph" style={{ color: accent }}>{sign.symbol}</span> {sign.name}</>, sub: sign.dates },
    { label: "chinese zodiac", value: info.chinese.animal, sub: `${info.chinese.element} ${info.chinese.animal}` },
    { label: "born on a", value: info.weekday },
    { label: "birthstone", value: info.birthstone },
    { label: "birth flower", value: info.flower },
    { label: "age", value: <span className="tabular-nums">{info.age}</span> },
  ];

  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4">
      <div className="rounded-xl border border-border bg-card/90 p-5 md:p-6 flex flex-col justify-between gap-6">
        <div>
          <p className="font-mono text-xs text-muted-foreground"><span className="tok-com">// </span>life path number</p>
          <div className="mt-3 flex items-baseline gap-4">
            <span className="display text-6xl text-primary tabular-nums">{info.lifePath}</span>
            <p className="text-muted-foreground leading-relaxed">{LIFE_PATH_MEANINGS[info.lifePath]}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-4 py-3">
          <Cake className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm">
            {info.daysToBirthday === 0
              ? <span className="font-medium">Happy birthday! 🎉</span>
              : <>Next birthday in <span className="font-medium tabular-nums">{info.daysToBirthday}</span> {info.daysToBirthday === 1 ? "day" : "days"}</>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-border bg-card/90 p-4">
            <div className="font-mono text-xs text-muted-foreground">{t.label}</div>
            <div className="mt-1.5 text-lg font-medium">{t.value}</div>
            {t.sub && <div className="text-xs text-muted-foreground mt-0.5">{t.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
