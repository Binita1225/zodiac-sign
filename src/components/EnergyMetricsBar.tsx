import { EnergyMetrics } from "@/lib/horoscope";

interface Props {
  metrics: EnergyMetrics;
  accent: string;
  loading?: boolean;
}

const LABELS: { key: keyof EnergyMetrics; label: string }[] = [
  { key: "focus", label: "Focus" },
  { key: "emotion", label: "Emotion" },
  { key: "luck", label: "Luck" },
  { key: "social", label: "Social" },
];

export default function EnergyMetricsBar({ metrics, accent, loading }: Props) {
  return (
    <div className="rounded-2xl border hairline p-5 bg-surface">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">Energy</div>
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
        {LABELS.map(({ key, label }, i) => {
          const v = loading ? 0 : metrics[key];
          return (
            <li key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="uppercase tracking-wider">{label}</span>
                <span className="tabular-nums text-foreground/70">{loading ? "—" : v}</span>
              </div>
              <div className="h-[3px] w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: loading ? "0%" : `${v}%`,
                    background: accent,
                    transitionDuration: "900ms",
                    transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
