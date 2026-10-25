import { CONSTELLATIONS } from "@/data/constellations";
import { ZodiacKey } from "@/data/zodiacs";

// A sign's constellation as faint lines with softly twinkling stars, coloured by --h.
export default function Constellation({ sign, className = "" }: { sign: ZodiacKey; className?: string }) {
  const c = CONSTELLATIONS[sign];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="none">
      <g stroke="hsl(var(--h) 70% 70%)" strokeOpacity="0.45" strokeWidth="0.6" strokeLinecap="round">
        {c.lines.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={c.stars[a][0]} y1={c.stars[a][1]} x2={c.stars[b][0]} y2={c.stars[b][1]} />
        ))}
      </g>
      {c.stars.map(([x, y], i) => (
        <g key={i} className="motion-safe:animate-twinkle" style={{ animationDelay: `${(i * 0.37) % 3}s`, transformOrigin: `${x}px ${y}px` }}>
          <circle cx={x} cy={y} r="3.2" fill="hsl(var(--h) 80% 75%)" opacity="0.18" />
          <circle cx={x} cy={y} r="1.3" fill="rgb(245 243 255)" />
        </g>
      ))}
    </svg>
  );
}
