import Starfield from "./Starfield";
import { useTheme } from "./ThemeProvider";

interface Props {
  hue?: number;
}

// Fixed sky behind the whole page: twinkling starfield plus two slow-drifting
// nebula clouds, one tinted by the selected sign.
export default function CosmicBackground({ hue }: Props) {
  const tint = hue ?? 292;
  const { theme } = useTheme();
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vh] rounded-full blur-3xl animate-drift transition-[background] duration-1000"
        style={{ background: `radial-gradient(closest-side, hsl(${tint} 70% 55% / ${theme === "dark" ? 0.16 : 0.1}), transparent)` }}
      />
      <div
        className="absolute top-[35%] -right-[15%] w-[60vw] h-[70vh] rounded-full blur-3xl animate-drift"
        style={{ background: `radial-gradient(closest-side, oklch(0.55 0.2 292 / ${theme === "dark" ? 0.14 : 0.08}), transparent)`, animationDelay: "-20s" }}
      />
      <Starfield hue={tint} dark={theme === "dark"} />
    </div>
  );
}
