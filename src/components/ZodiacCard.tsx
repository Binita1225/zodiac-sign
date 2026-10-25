import Constellation from "./Constellation";
import { ZodiacSign } from "@/data/zodiacs";
import { spotlight } from "@/lib/utils";

interface Props {
  sign: ZodiacSign;
  active?: boolean;
  onClick?: () => void;
  index?: number;
}

export default function ZodiacCard({ sign, active, onClick, index = 0 }: Props) {
  const accent = `hsl(${sign.hue} 70% 60%)`;

  return (
    <button
      onClick={onClick}
      onPointerMove={spotlight}
      style={{
        animationDelay: `${index * 35}ms`,
        "--h": sign.hue,
        ...(active && {
          borderColor: `hsl(${sign.hue} 70% 60% / 0.7)`,
          boxShadow: `0 0 0 1px hsl(${sign.hue} 70% 60% / 0.35), 0 20px 50px -25px hsl(${sign.hue} 75% 55% / 0.8)`,
        }),
      } as React.CSSProperties}
      className="group text-left p-3 sm:p-4 rounded-xl surface card-hue spotlight hover:-translate-y-0.5 animate-fade-in focus-ring"
      aria-pressed={active}
    >
      <Constellation
        sign={sign.key}
        className={`absolute right-1 top-1 -z-10 w-16 h-16 pointer-events-none transition-opacity duration-500 ${active ? "opacity-90" : "opacity-25 group-hover:opacity-80"}`}
      />
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          className="glyph shrink-0 grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-lg transition-smooth"
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
          <div className="text-[11px] sm:text-xs text-muted-foreground truncate">{sign.dates}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] uppercase tracking-wide sm:tracking-wider text-muted-foreground">
        <span>{sign.element}</span>
        <span className="opacity-60 truncate">{sign.tagline}</span>
      </div>
    </button>
  );
}
