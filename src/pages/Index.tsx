import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import CosmicBackground from "@/components/CosmicBackground";
import ZodiacCard from "@/components/ZodiacCard";
import HoroscopeDisplay from "@/components/HoroscopeDisplay";
import CompatibilitySection from "@/components/CompatibilitySection";
import DateOfBirthInput from "@/components/DateOfBirthInput";
import GreetingBar from "@/components/GreetingBar";
import DesignPhilosophy from "@/components/DesignPhilosophy";
import { ZODIACS, ZodiacKey, getZodiacByKey } from "@/data/zodiacs";
import { setLastSign } from "@/lib/user";

const STORAGE_KEY = "zi-selected-sign";

const Index = () => {
  const [selected, setSelected] = useState<ZodiacKey>("leo");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ZodiacKey | null;
    if (saved && ZODIACS.some((z) => z.key === saved)) setSelected(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selected);
    setLastSign(selected);
  }, [selected]);

  const sign = useMemo(() => getZodiacByKey(selected), [selected]);

  return (
    <div id="top" className="min-h-screen relative">
      <CosmicBackground hue={sign.hue} />
      <Navbar />

      <main className="container py-12 md:py-20 space-y-16 md:space-y-24">
        {/* Hero */}
        <section className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-5 animate-fade-in">
            Zodiac Insight
          </div>
          <h1 className="display text-5xl md:text-7xl leading-[1.05] animate-slide-up">
            A quieter way to read <span className="text-gradient">the stars</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl animate-slide-up" style={{ animationDelay: "80ms" }}>
            Daily horoscopes, compatibility, and lucky details — distilled into a calm,
            considered interface for the cosmically curious.
          </p>

          <div className="mt-6 animate-slide-up" style={{ animationDelay: "120ms" }}>
            <GreetingBar currentSign={selected} />
          </div>

          <div className="mt-8 animate-slide-up" style={{ animationDelay: "160ms" }}>
            <DateOfBirthInput onDetect={(z) => setSelected(z.key)} />
          </div>
        </section>

        {/* Zodiac grid */}
        <section id="signs">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Choose your sign</div>
              <h2 className="display text-3xl md:text-4xl">Twelve signs, one sky</h2>
            </div>
            <div className="hidden md:block text-sm text-muted-foreground">
              Currently reading <span className="text-foreground font-medium">{sign.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {ZODIACS.map((z, i) => (
              <ZodiacCard
                key={z.key}
                sign={z}
                index={i}
                active={z.key === selected}
                onClick={() => {
                  setSelected(z.key);
                  document.getElementById("reading")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            ))}
          </div>
        </section>

        {/* Reading */}
        <HoroscopeDisplay sign={sign} />

        {/* Compatibility */}
        <CompatibilitySection initial={selected} />

        {/* Footer */}
        <footer className="pt-8 pb-4 space-y-6 border-t hairline">
          <DesignPhilosophy />
          <p className="text-center text-sm text-muted-foreground">
            Crafted with care · Zodiac Insight © {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
