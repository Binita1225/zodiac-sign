import { useId } from "react";

// A rendered moon (no image asset): textured disc, maria, craters, a soft terminator
// drawn from the real phase angle (0 new → 180 full → 360), and a glow.
export default function MoonRender({ angle, className = "w-28 h-28" }: { angle: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const R = 40, C = 60;
  const rad = (angle * Math.PI) / 180;
  const rx = Math.abs(Math.cos(rad)) * R;
  const waxing = angle < 180;
  const crescent = Math.cos(rad) > 0;
  const term = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0;
  const darkOuter = waxing ? 0 : 1; // the unlit limb is on the opposite side to the lit one
  const shadow = `M${C} ${C - R} A${R} ${R} 0 0 ${darkOuter} ${C} ${C + R} A${rx} ${R} 0 0 ${term} ${C} ${C - R}Z`;
  const lit = (1 - Math.cos(rad)) / 2;

  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Current moon phase">
      <defs>
        <radialGradient id={`g${id}`}>
          <stop offset="55%" stopColor="rgb(255 248 225)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="rgb(255 248 225)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`b${id}`} cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#fffbf1" />
          <stop offset="60%" stopColor="#ebe4d3" />
          <stop offset="100%" stopColor="#bdb5a5" />
        </radialGradient>
        <filter id={`t${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="4" seed="11" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.32  0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 -1.6 1.05" />
        </filter>
        <filter id={`s${id}`}><feGaussianBlur stdDeviation="1.8" /></filter>
        <filter id={`m${id}`}><feGaussianBlur stdDeviation="2.4" /></filter>
        <clipPath id={`c${id}`}><circle cx={C} cy={C} r={R} /></clipPath>
      </defs>

      <circle cx={C} cy={C} r={58} fill={`url(#g${id})`} opacity={0.25 + 0.75 * lit} className="motion-safe:animate-pulse-slow" />

      <g clipPath={`url(#c${id})`}>
        <circle cx={C} cy={C} r={R} fill={`url(#b${id})`} />
        <rect x={C - R} y={C - R} width={R * 2} height={R * 2} filter={`url(#t${id})`} opacity="0.2" />
        {/* Maria (the dark "seas"), roughly where they sit on the near side */}
        <g fill="#8a8478" opacity="0.32" filter={`url(#m${id})`}>
          <ellipse cx="50" cy="44" rx="12" ry="9" />
          <ellipse cx="66" cy="47" rx="7" ry="6" />
          <ellipse cx="70" cy="58" rx="8" ry="7" />
          <ellipse cx="82" cy="50" rx="4" ry="5" />
          <ellipse cx="40" cy="60" rx="9" ry="13" />
          <ellipse cx="60" cy="70" rx="6" ry="5" />
        </g>
        {/* A few craters */}
        <g fill="none" stroke="#8f887c" strokeOpacity="0.45" strokeWidth="0.6">
          <circle cx="57" cy="86" r="3" />
          <circle cx="76" cy="78" r="2" />
          <circle cx="35" cy="45" r="1.6" />
          <circle cx="88" cy="64" r="1.4" />
        </g>
        <circle cx="57" cy="86" r="0.9" fill="#fff" opacity="0.5" />
        {/* Unlit side, softened so the terminator isn't a hard line; a little earthshine shows through */}
        <path d={shadow} fill="rgb(12 10 24)" fillOpacity="0.9" filter={`url(#s${id})`} />
      </g>
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgb(255 250 235)" strokeOpacity="0.12" />
    </svg>
  );
}
