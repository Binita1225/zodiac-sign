import { useEffect, useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const SECTIONS = [
  { id: "sky", label: "Sky" },
  { id: "today", label: "Today" },
  { id: "signs", label: "Signs" },
  { id: "reading", label: "Reading" },
  { id: "chart", label: "Big Three" },
  { id: "compatibility", label: "Match" },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the section in the middle of the viewport.
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const go = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 px-3 sm:px-4 pt-3">
      <div
        className={`max-w-7xl mx-auto rounded-2xl border transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled || open
            ? "bg-card/80 border-border backdrop-blur-xl [box-shadow:var(--shadow-nav)]"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="h-14 pl-4 pr-2 flex items-center justify-between gap-4">
          <a href="#top" onClick={(e) => go("top", e)} className="font-mono text-[15px] font-semibold tracking-tight focus-ring rounded" aria-label="Zodiac Insight, back to top">
            zodiac<span className="text-muted-foreground">.insight</span>
            <span className="text-primary caret">_</span>
          </a>

          <nav aria-label="Main" className="hidden md:flex items-center gap-0.5 p-1 rounded-xl border border-border bg-background/40">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => go(s.id, e)}
                aria-current={activeId === s.id ? "location" : undefined}
                className={`text-sm px-3.5 py-1.5 rounded-lg transition-colors focus-ring ${
                  activeId === s.id ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-ring"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-accent transition-colors focus-ring"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav aria-label="Main" className="md:hidden px-2 pb-2 animate-fade-in">
            <div className="border-t border-border pt-2 grid">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => go(s.id, e)}
                  className={`px-3 py-3 rounded-lg text-[15px] transition-colors ${
                    activeId === s.id ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
