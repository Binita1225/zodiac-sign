import { ZODIACS } from "@/data/zodiacs";

// Decorative, slowly turning zodiac wheel: degree ticks and the twelve glyphs.
export default function ZodiacRing({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={`motion-safe:animate-spin-slow ${className}`} aria-hidden fill="none">
      <circle cx="200" cy="200" r="196" stroke="currentColor" strokeOpacity="0.5" />
      <circle cx="200" cy="200" r="160" stroke="currentColor" strokeOpacity="0.35" />
      <circle cx="200" cy="200" r="120" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="2 6" />
      {Array.from({ length: 72 }, (_, i) => {
        const a = (i * 5 * Math.PI) / 180, long = i % 6 === 0;
        const r1 = 196, r2 = long ? 182 : 189;
        return <line key={i} x1={200 + r1 * Math.cos(a)} y1={200 + r1 * Math.sin(a)} x2={200 + r2 * Math.cos(a)} y2={200 + r2 * Math.sin(a)} stroke="currentColor" strokeOpacity={long ? 0.6 : 0.3} />;
      })}
      {ZODIACS.map((z, i) => {
        const a = ((i * 30 + 15 - 90) * Math.PI) / 180;
        return (
          <text key={z.key} x={200 + 171 * Math.cos(a)} y={200 + 171 * Math.sin(a)} textAnchor="middle" dominantBaseline="central"
                fontSize="18" className="glyph" fill={`hsl(${z.hue} 70% 65%)`} fillOpacity="0.85">
            {z.symbol}
          </text>
        );
      })}
    </svg>
  );
}
