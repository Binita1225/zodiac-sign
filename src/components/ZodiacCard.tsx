import { ZodiacSign } from "@/data/zodiacs";
import { cn } from "@/lib/utils";

interface Props {
  sign: ZodiacSign;
  active?: boolean;
  onClick?: () => void;
  index?: number;
}

export default function ZodiacCard({ sign, active, onClick, index = 0 }: Props) {
  const accent = `hsl(${sign.hue} 70% 60%)`;
  const accentSoft = `hsl(${sign.hue} 80% 92%)`;
  const accentSoftDark = `hsl(${sign.hue} 40% 18%)`;

  return (
    <button
      onClick={onClick}
      style={{
        animationDelay: `${index * 35}ms`,
        ['--sign-accent' as any]: accent,
        ['--sign-soft' as any]: accentSoft,
        ['--sign-soft-dark' as any]: accentSoftDark,
      }}
      className={cn(
        "group relative text-left p-4 rounded-2xl surface transition-smooth animate-fade-in focus-ring",
        "hover:-translate-y-0.5 hover:shadow-lg",
        active && "glow-active scale-[1.03]"
      )}
      aria-pressed={active}
    >
      {/* Soft accent halo */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-smooth"
        style={{
          background: `radial-gradient(120px 80px at 50% 0%, ${accent}22, transparent 70%)`,
        }}
      />
      <div className="flex items-center gap-3">
        <div
          className="grid place-items-center w-10 h-10 rounded-full text-lg transition-smooth"
          style={{
            background: `color-mix(in oklab, ${accent} 14%, transparent)`,
            color: accent,
            boxShadow: active ? `0 0 0 1px ${accent}55, 0 0 24px ${accent}55` : undefined,
          }}
        >
          {sign.symbol}
        </div>
        <div className="min-w-0">
          <div className="font-medium leading-tight">{sign.name}</div>
          <div className="text-xs text-muted-foreground truncate">{sign.dates}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
        <span>{sign.element}</span>
        <span className="opacity-60">{sign.tagline}</span>
      </div>
    </button>
  );
}
