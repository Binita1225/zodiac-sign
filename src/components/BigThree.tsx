import { useEffect, useMemo, useState } from "react";
import { MapPin, Clock, Calendar } from "lucide-react";
import { bigThree } from "@/lib/sky";
import type { BirthData } from "@/lib/chart";
import BirthChart from "./BirthChart";
import { CITIES } from "@/data/cities";
import { localISODate, parseLocalDate } from "@/lib/utils";
import { ZodiacSign } from "@/data/zodiacs";

const ROLES = [
  { key: "sun", label: "Sun", meaning: "Your core self — identity, drive, what you're here to do." },
  { key: "moon", label: "Moon", meaning: "Your inner world — emotions, needs, what makes you feel safe." },
  { key: "rising", label: "Rising", meaning: "Your outer style — first impressions and how others see you." },
] as const;

const field = "w-full h-11 pl-10 pr-3 rounded-md border border-input bg-background text-base outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors";

// Loaded lazily (pulls in the astronomy library). The <section> wrapper lives in Index.
interface Props {
  date: string;          // shared with the hero's date-of-birth field
  time: string;          // shared with the hero's birth-time field
  onDate: (v: string) => void;
  onTime: (v: string) => void;
  saved: BirthData | null;
  onSave: (b: BirthData) => void;
}

export default function BigThree({ date, time, onDate, onTime, saved, onSave }: Props) {
  const [noTime, setNoTime] = useState(saved ? saved.time === "" : false);
  // Typing a time anywhere (here or in the hero) means it's known.
  useEffect(() => { if (time) setNoTime(false); }, [time]);
  const [cityName, setCityName] = useState(saved?.city.name ?? "");
  const [error, setError] = useState("");

  // Results come from the saved birth details, so they're back on the next visit.
  const result = useMemo(() => {
    if (!saved) return null;
    const [y, m, d] = saved.date.split("-").map(Number);
    const t = /^(\d{2}):(\d{2})$/.exec(saved.time);
    return bigThree({ y, m, d }, t ? { h: +t[1], mi: +t[2] } : null, saved.city);
  }, [saved]);

  const dateValue = date;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseLocalDate(dateValue);
    const city = CITIES.find((c) => c.name.toLowerCase() === cityName.trim().toLowerCase());
    const t = /^(\d{2}):(\d{2})$/.exec(time);
    if (!d) return setError("Enter your birth date.");
    if (!noTime && !t) return setError("Enter your birth time, or tick “I don't know”.");
    if (!city) return setError("Pick your birth city from the list (or the nearest big city).");
    setError("");
    onSave({ date: dateValue, time: noTime || !t ? "" : time, city });
  };

  return (
    <>
    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-4">
      <form onSubmit={submit} className="rounded-xl border border-border bg-card/90 p-5 md:p-6 space-y-4" noValidate>
        <Field label="birth date" htmlFor="bt-date" icon={<Calendar className="w-4 h-4" />}>
          <input id="bt-date" type="date" className={field} max={localISODate()} value={dateValue}
                 onChange={(e) => onDate(e.target.value)} />
        </Field>

        <Field label="birth time" htmlFor="bt-time" icon={<Clock className="w-4 h-4" />}>
          <input id="bt-time" type="time" className={`${field} disabled:opacity-50`} value={time} disabled={noTime}
                 onChange={(e) => onTime(e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input type="checkbox" checked={noTime} onChange={(e) => setNoTime(e.target.checked)} className="w-4 h-4 accent-[oklch(var(--primary))]" />
          I don't know my birth time
        </label>

        <Field label="birth city" htmlFor="bt-city" icon={<MapPin className="w-4 h-4" />}>
          <input id="bt-city" list="bt-cities" className={field} placeholder="Start typing… e.g. Kathmandu" autoComplete="off"
                 value={cityName} onChange={(e) => setCityName(e.target.value)} />
          <datalist id="bt-cities">
            {CITIES.map((c) => <option key={c.name} value={c.name} />)}
          </datalist>
        </Field>
        <p className="text-xs text-muted-foreground">Not listed? Pick the nearest big city — it's accurate enough for your rising sign.</p>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <button type="submit" className="btn-primary w-full">
          Calculate my Big Three
        </button>
      </form>

      <div className="grid gap-3 content-start" aria-live="polite">
        {ROLES.map((r) => {
          const sign: ZodiacSign | null | undefined = result?.[r.key];
          const accent = sign ? `hsl(${sign.hue} 70% 60%)` : undefined;
          return (
            <div key={r.key} className="rounded-xl border border-border bg-card/90 p-5 flex items-center gap-4">
              <span className="glyph grid place-items-center w-14 h-14 rounded-full text-2xl shrink-0 bg-secondary"
                    style={accent ? { color: accent, background: `color-mix(in oklab, ${accent} 14%, transparent)` } : undefined}>
                {sign ? sign.symbol : "?"}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{r.label.toLowerCase()} sign</p>
                <p className="display text-xl">
                  {!result ? "—" : sign ? sign.name : "Needs birth time"}
                  {r.key === "moon" && result?.moonUncertain && (
                    <span className="ml-2 align-middle font-mono text-[11px] font-normal px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                      changed sign that day
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{r.meaning}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    {saved && <BirthChart birth={saved} />}
    </>
  );
}

function Field({ label, htmlFor, icon, children }: { label: string; htmlFor: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="eyebrow block mb-2"><span className="tok-com">// </span>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">{icon}</span>
        {children}
      </div>
    </div>
  );
}
