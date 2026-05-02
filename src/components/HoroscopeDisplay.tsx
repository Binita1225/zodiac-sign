import { useEffect, useState } from "react";
import { ZodiacSign } from "@/data/zodiacs";
import { fetchHoroscope, getCached, getCosmicAdvice, Horoscope, Period } from "@/lib/horoscope";
import { Heart, Briefcase, Activity, Sparkles, Share2, Wand2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import EnergyMetricsBar from "./EnergyMetricsBar";
import ShareCard from "./ShareCard";

interface Props {
  sign: ZodiacSign;
}

const TABS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "week", label: "This Week" },
];

export default function HoroscopeDisplay({ sign }: Props) {
  const [period, setPeriod] = useState<Period>("today");
  const [data, setData] = useState<Horoscope | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const accent = `hsl(${sign.hue} 70% 60%)`;

  // Reset reveal when sign changes
  useEffect(() => {
    setRevealed(false);
    setData(null);
    setAdvice(null);
  }, [sign.key]);

  // Fetch when revealed or period changes (only after first reveal)
  useEffect(() => {
    if (!revealed) return;
    let cancelled = false;
    setLoading(true);
    fetchHoroscope(sign.key, period)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {
        const cached = getCached(sign.key, period);
        if (cached && !cancelled) {
          setData({ ...cached, cached: true });
          toast.message("Showing your last saved insight.");
        } else if (!cancelled) {
          toast.error("Couldn't load reading. Please try again.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [sign.key, period, revealed]);

  const onShare = () => {
    if (!data) return;
    setShareOpen(true);
  };

  const onAdvice = () => {
    setAdvice(getCosmicAdvice(`${sign.key}-${Date.now()}`));
  };

  return (
    <section
      id="reading"
      className="surface rounded-3xl p-6 md:p-10 animate-fade-in relative overflow-hidden"
      key={sign.key}
      style={{
        backgroundImage: `radial-gradient(600px 200px at 100% 0%, hsl(${sign.hue} 70% 60% / 0.06), transparent 70%)`,
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
            Your reading
            {data?.cached && (
              <span className="normal-case tracking-normal text-[10px] px-2 py-0.5 rounded-full border hairline text-muted-foreground">
                Last updated insight
              </span>
            )}
          </div>
          <h2 className="display text-4xl md:text-5xl">
            <span className="text-gradient">{sign.name}</span>
            <span className="ml-3 text-2xl md:text-3xl text-muted-foreground" style={{ color: accent }}>{sign.symbol}</span>
          </h2>
          <div className="text-sm text-muted-foreground mt-2">
            {sign.dates} · {sign.element} · {sign.tagline}
          </div>
        </div>

        <div className="flex items-center gap-2" role="group" aria-label="Reading period">
          <div className="inline-flex p-1 rounded-full border hairline bg-surface" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={period === t.key}
                onClick={() => setPeriod(t.key)}
                className={`relative px-3 md:px-4 py-1.5 text-xs md:text-sm rounded-full transition-smooth focus-ring ${
                  period === t.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={onShare}
            disabled={!data}
            className="grid place-items-center w-9 h-9 rounded-full border hairline hover:bg-secondary transition-smooth focus-ring disabled:opacity-40"
            aria-label="Share reading"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reveal gate */}
      {!revealed && (
        <div className="mt-10 grid place-items-center py-12 md:py-16 animate-fade-in">
          <div
            aria-hidden
            className="absolute pointer-events-none w-[28rem] h-[28rem] rounded-full blur-3xl opacity-40 animate-pulse-slow"
            style={{ background: `radial-gradient(closest-side, ${accent}, transparent 70%)` }}
          />
          <p className="text-sm text-muted-foreground mb-5 max-w-sm text-center">
            Your daily card is sealed. Take a breath, then reveal it.
          </p>
          <button
            onClick={() => setRevealed(true)}
            className="group relative inline-flex items-center gap-2 px-6 h-12 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-smooth focus-ring"
            style={{ boxShadow: `0 0 0 1px ${accent}33, 0 18px 50px -18px ${accent}` }}
          >
            <Eye className="w-4 h-4" />
            Reveal Insight
          </button>
        </div>
      )}

      {/* Body */}
      {revealed && (
        <>
          {/* One-liner */}
          <div className="mt-8 animate-fade-in">
            {loading || !data ? (
              <Skeleton className="h-5 w-2/3" />
            ) : (
              <p className="display text-xl md:text-2xl leading-snug text-foreground/90" style={{ animationDelay: "120ms" }}>
                "{data.oneLiner}"
              </p>
            )}
          </div>

          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ReadingBlock loading={loading} icon={<Sparkles className="w-4 h-4" />} title="General" body={data?.general} accent={accent} large />
              <div className="grid sm:grid-cols-3 gap-4">
                <ReadingBlock loading={loading} icon={<Heart className="w-4 h-4" />} title="Love" body={data?.love} accent={accent} />
                <ReadingBlock loading={loading} icon={<Briefcase className="w-4 h-4" />} title="Career" body={data?.career} accent={accent} />
                <ReadingBlock loading={loading} icon={<Activity className="w-4 h-4" />} title="Health" body={data?.health} accent={accent} />
              </div>

              {/* Energy + Advice */}
              <EnergyMetricsBar metrics={data?.energy ?? { focus: 0, emotion: 0, luck: 0, social: 0 }} accent={accent} loading={loading || !data} />

              <div className="rounded-2xl border hairline p-5 bg-surface flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">Cosmic advice</div>
                  <p key={advice} className="text-sm md:text-base text-foreground/90 animate-fade-in">
                    {advice ?? "A small directive, when you want one."}
                  </p>
                </div>
                <button
                  onClick={onAdvice}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full border hairline hover:bg-secondary text-sm transition-smooth focus-ring"
                  aria-label="Get new cosmic advice"
                >
                  <Wand2 className="w-4 h-4" />
                  {advice ? "Another" : "Get Cosmic Advice"}
                </button>
              </div>
            </div>

            {/* Side panel */}
            <aside className="rounded-2xl border hairline p-6 bg-surface flex flex-col gap-6">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{loading || !data ? "Loading…" : data.date}</div>

              <div className="grid grid-cols-2 gap-4">
                <Stat label="Lucky number" value={loading || !data ? "—" : String(data.luckyNumber)} accent={accent} />
                <Stat label="Lucky color" value={loading || !data ? "—" : data.luckyColor} accent={accent} />
              </div>

              <MoodRing value={loading || !data ? 0 : data.mood} accent={accent} loading={loading || !data} />
            </aside>
          </div>
        </>
      )}

      {data && (
        <ShareCard open={shareOpen} onClose={() => setShareOpen(false)} sign={sign} horoscope={data} />
      )}
    </section>
  );
}

function ReadingBlock({
  loading, icon, title, body, accent, large,
}: { loading: boolean; icon: React.ReactNode; title: string; body?: string; accent: string; large?: boolean }) {
  return (
    <div className="rounded-2xl border hairline p-5 bg-surface">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
        <span className="grid place-items-center w-6 h-6 rounded-full" style={{ background: `${accent}1f`, color: accent }}>{icon}</span>
        {title}
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-[90%] shimmer" />
          <Skeleton className="h-4 w-[75%] shimmer" />
          {large && <Skeleton className="h-4 w-[60%] shimmer" />}
        </div>
      ) : (
        <p className={`${large ? "text-lg leading-relaxed" : "text-sm leading-relaxed"} text-foreground/90 animate-fade-in`}>{body}</p>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl p-4 border hairline">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="display text-2xl mt-1" style={{ color: accent }}>{value}</div>
    </div>
  );
}

function MoodRing({ value, accent, loading }: { value: number; accent: string; loading: boolean }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex items-center gap-5">
      <div className="relative w-28 h-28">
        {/* Soft pulsing halo behind ring */}
        <div
          aria-hidden
          className="absolute inset-2 rounded-full blur-xl animate-pulse-slow"
          style={{ background: `radial-gradient(closest-side, ${accent}55, transparent 70%)`, opacity: loading ? 0.2 : 0.6 }}
        />
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 relative">
          <circle cx="50" cy="50" r={r} stroke="hsl(var(--hairline))" strokeWidth="6" fill="none" />
          <circle
            cx="50" cy="50" r={r} stroke={accent} strokeWidth="6" fill="none"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={loading ? c : offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center display text-2xl">
          {loading ? "—" : `${value}`}
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Mood</div>
        <div className="text-sm mt-1 max-w-[14ch]">
          {loading ? "Tuning into your frequency…" : value > 75 ? "Bright and centered" : value > 50 ? "Calm with momentum" : "Reflective and soft"}
        </div>
      </div>
    </div>
  );
}
