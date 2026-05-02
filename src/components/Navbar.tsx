import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b hairline">
      <div className="container flex items-center justify-between h-16">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="grid place-items-center w-8 h-8 rounded-full bg-foreground text-background transition-smooth group-hover:rotate-12">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="display text-lg">Zodiac <span className="text-muted-foreground">Insight</span></span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#signs" className="hover:text-foreground transition-smooth">Signs</a>
          <a href="#reading" className="hover:text-foreground transition-smooth">Reading</a>
          <a href="#compatibility" className="hover:text-foreground transition-smooth">Compatibility</a>
        </nav>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="grid place-items-center w-9 h-9 rounded-full border hairline hover:bg-secondary transition-smooth"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
