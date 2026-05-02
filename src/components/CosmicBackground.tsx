interface Props {
  hue?: number;
}

export default function CosmicBackground({ hue }: Props) {
  const tint = hue ?? 270;
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-cosmic" />
      <div
        className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full blur-3xl opacity-40 animate-float transition-all duration-1000"
        style={{ background: `radial-gradient(closest-side, hsl(${tint} 70% 60% / 0.22), transparent)` }}
      />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[42rem] h-[42rem] rounded-full blur-3xl opacity-35 animate-float transition-all duration-1000"
        style={{ background: `radial-gradient(closest-side, hsl(${(tint + 60) % 360} 70% 60% / 0.2), transparent)`, animationDelay: "-7s" }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-25 animate-pulse-slow transition-all duration-1000"
        style={{ background: `radial-gradient(closest-side, hsl(${(tint + 180) % 360} 70% 60% / 0.18), transparent)` }}
      />
    </div>
  );
}
