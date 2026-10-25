import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import CosmicBackground from "@/components/CosmicBackground";
import ZodiacCard from "@/components/ZodiacCard";
import HoroscopeDisplay from "@/components/HoroscopeDisplay";
import CompatibilitySection from "@/components/CompatibilitySection";
import DateOfBirthInput from "@/components/DateOfBirthInput";
import GreetingBar from "@/components/GreetingBar";
import DesignPhilosophy from "@/components/DesignPhilosophy";
import { ZODIACS, ZodiacKey, getZodiacByKey, getZodiacFromDate } from "@/data/zodiacs";
import BirthdayInsights from "@/components/BirthdayInsights";
import SignProfile from "@/components/SignProfile";
import { parseLocalDate } from "@/lib/utils";
import { getBirth, getDob, getLastSign, getUserName, setBirth, setDob, setLastSign } from "@/lib/user";
import TarotCard from "@/components/TarotCard";
import ZodiacRing from "@/components/ZodiacRing";
import type { BirthData } from "@/lib/chart";
import { ArrowRight } from "lucide-react";

// These pull in the astronomy library, so they load after the first paint.
const SkyToday = lazy(() => import("@/components/SkyToday"));
const BigThree = lazy(() => import("@/components/BigThree"));
const YourDay = lazy(() => import("@/components/YourDay"));
const CosmicCalendar = lazy(() => import("@/components/CosmicCalendar"));

// Shareable links: ?sign=leo opens a sign, ?match=leo,aries opens a pairing.
const params = new URLSearchParams(window.location.search);
const isSign = (v: string | null): v is ZodiacKey => ZODIACS.some((z) => z.key === v);
const linkSign = params.get("sign");
const linkMatch = (params.get("match") ?? "").split(",");
const initialMatch = isSign(linkMatch[0]) && isSign(linkMatch[1]) ? [linkMatch[0], linkMatch[1]] as const : null;

const Index = () => {
  const [selected, setSelected] = useState<ZodiacKey>(() => (isSign(linkSign) ? linkSign : getLastSign() ?? "leo"));
  const [birth, setBirthState] = useState<BirthData | null>(getBirth);
  const saveBirth = (b: BirthData) => { setBirthState(b); setBirth(b); };

  useEffect(() => {
    setLastSign(selected);
    // Keep the address bar shareable: it always points at the sign being read.
    if (!initialMatch) history.replaceState(null, "", `?sign=${selected}${window.location.hash}`);
  }, [selected]);

  // Arriving from a ?match= link: jump to the comparison once.
  useEffect(() => {
    if (initialMatch) document.getElementById("compatibility")?.scrollIntoView();
  }, []);

  const sign = useMemo(() => getZodiacByKey(selected), [selected]);

  // One birth date + time for the whole page: the hero and the Big Three form edit the same values.
  const [dob, setDobState] = useState(() => getDob() || getBirth()?.date || "");
  const [btime, setBtime] = useState(() => getBirth()?.time ?? "");
  const dobDate = useMemo(() => parseLocalDate(dob), [dob]);
  const onDob = (v: string) => {
    setDobState(v);
    setDob(v);
    const d = parseLocalDate(v);
    if (!d) return;
    setSelected(getZodiacFromDate(d).key);
    if (birth) saveBirth({ ...birth, date: v }); // keep the chart in step
  };
  const onTime = (v: string) => {
    setBtime(v);
    if (birth && /^\d{2}:\d{2}$/.test(v)) saveBirth({ ...birth, time: v });
  };

  return (
    <div id="top" className="min-h-screen relative isolate overflow-x-clip" style={{ "--h": sign.hue } as React.CSSProperties}>
      <CosmicBackground hue={sign.hue} />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-8 space-y-16 md:space-y-24">
        {/* Hero */}
        <section id="hero" className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="animate-slide-up">
            <p className="text-base md:text-lg text-muted-foreground">
              Daily horoscopes for <span className="text-foreground font-medium">all twelve signs</span>.
            </p>
            <h1 className="display mt-3 text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05]">
              A quieter way to read <span className="text-gradient">the stars</span>.
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Readings, compatibility and lucky details, kept calm and simple.
              Pick your sign or enter your birthday to begin.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#reading"
                onClick={(e) => { e.preventDefault(); document.getElementById("reading")?.scrollIntoView({ behavior: "smooth" }); }}
                className="group btn-primary"
              >
                Read {sign.name}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#signs"
                onClick={(e) => { e.preventDefault(); document.getElementById("signs")?.scrollIntoView({ behavior: "smooth" }); }}
                className="btn-ghost"
              >
                Browse signs
              </a>
            </div>
          </div>

          {/* Terminal-style panel over a slowly turning zodiac wheel */}
          <div className="relative">
          <ZodiacRing className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] max-w-[40rem] -z-10 text-primary opacity-[0.22]" />
          <div className="rounded-xl border border-border bg-card/90 overflow-hidden shadow-[0_30px_80px_-40px_var(--glow)] animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-2 px-4 h-10 border-b border-border bg-secondary/60">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-xs text-muted-foreground truncate">~/zodiac --find-my-sign</span>
            </div>
            <div className="p-5 md:p-6 space-y-6">
              <GreetingBar currentSign={selected} />
              <DateOfBirthInput value={dob} onChange={onDob} time={btime} onTimeChange={onTime} chartHint={!birth} />
            </div>
          </div>
          </div>
        </section>

        <Section id="sky" cmd="sky --now" title="The sky right now">
          <Suspense fallback={<Placeholder />}>
            <SkyToday />
          </Suspense>
        </Section>

        <Section id="today" cmd="today --for you" title="Your day">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
            <Suspense fallback={<Placeholder />}>
              <YourDay birth={birth} />
            </Suspense>
            <TarotCard seed={getUserName() || selected} />
          </div>
        </Section>

        <Section id="calendar" cmd="cal --next 90d" title="Coming up in the sky" aside="Sign changes, retrogrades, full and new moons — and eclipses up to a year ahead.">
          <Suspense fallback={<Placeholder />}>
            <CosmicCalendar />
          </Suspense>
        </Section>

        {dobDate && (
          <Section id="birthday" cmd={`whoami --born ${dob}`} title="Your birthday, decoded">
            <BirthdayInsights dob={dobDate} />
          </Section>
        )}

        {/* Zodiac grid */}
        <section id="signs" className="scroll-mt-24">
          <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
            <div>
              <p className="eyebrow"><span className="tok-str">$</span> ls ./signs</p>
              <h2 className="display mt-2 text-2xl sm:text-3xl md:text-4xl">Twelve signs, one sky</h2>
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

        <Section id="profile" cmd={`man ${sign.key}`} title={`All about ${sign.name}`}>
          <SignProfile sign={sign} />
        </Section>

        <Section
          id="chart"
          cmd="chart --big-three"
          title="Your Big Three"
          aside="Your Sun sign is only part of the story. Add your birth time and place to find your Moon and Rising signs."
        >
          <Suspense fallback={<Placeholder />}>
            <BigThree date={dob} time={btime} onDate={onDob} onTime={onTime} saved={birth} onSave={saveBirth} />
          </Suspense>
        </Section>

        {/* Compatibility */}
        <CompatibilitySection initial={initialMatch ?? [selected, selected === "leo" ? "aquarius" : "leo"]} />

        {/* Footer */}
        <footer className="pt-8 pb-4 space-y-6 border-t border-border">
          <DesignPhilosophy />
          <p className="text-center font-mono text-xs text-muted-foreground">
            zodiac.insight · © {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  );
};

function Section({ id, cmd, title, aside, children }: { id: string; cmd: string; title: string; aside?: string; children: React.ReactNode }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id={id} className="scroll-mt-24 reveal">
      <div className="flex items-end justify-between gap-4 mb-6 md:mb-8 flex-wrap">
        <div>
          <p className="eyebrow"><span className="tok-str">$</span> {cmd}</p>
          <h2 className="display mt-2 text-2xl sm:text-3xl md:text-4xl">{title}</h2>
        </div>
        {aside && <p className="text-sm text-muted-foreground max-w-md">{aside}</p>}
      </div>
      {children}
    </section>
  );
}

// Adds .is-visible once the element scrolls into view (CSS handles the fade-up).
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("is-visible"); io.disconnect(); }
    }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Placeholder() {
  return <div className="h-64 rounded-xl border border-border bg-card/90 animate-pulse" aria-busy="true" />;
}

export default Index;
