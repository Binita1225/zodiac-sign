import { getZodiacFromDate, ZodiacSign } from "@/data/zodiacs";
import { Calendar, Clock } from "lucide-react";
import { localISODate, parseLocalDate } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  time: string;
  onTimeChange: (v: string) => void;
  chartHint: boolean; // nudge towards Big Three when no birth city is saved yet
}

const field = "w-full h-11 pl-10 pr-3 rounded-md border border-input bg-background text-base outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors";

// Date and time here are the same values as in the Big Three form (state lives in Index).
export default function DateOfBirthInput({ value, onChange, time, onTimeChange, chartHint }: Props) {
  const d = parseLocalDate(value);
  const detected: ZodiacSign | null = d ? getZodiacFromDate(d) : null;

  return (
    <div>
      <div className="grid sm:grid-cols-[1.4fr_1fr] gap-3">
        <div>
          <label htmlFor="dob" className="eyebrow block mb-2"><span className="tok-com">// </span>date of birth</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input id="dob" type="date" value={value} onChange={(e) => onChange(e.target.value)} className={field} max={localISODate()} />
          </div>
        </div>
        <div>
          <label htmlFor="dob-time" className="eyebrow block mb-2"><span className="tok-com">// </span>time <span className="opacity-60">(optional)</span></label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input id="dob-time" type="time" value={time} onChange={(e) => onTimeChange(e.target.value)} className={field} />
          </div>
        </div>
      </div>
      <p className="mt-3 font-mono text-sm text-muted-foreground" aria-live="polite">
        {detected ? (
          <>
            <span className="tok-str">→</span> you're a{" "}
            <span className="text-foreground font-medium"><span className="glyph">{detected.symbol}</span> {detected.name}</span>
            {chartHint && <a href="#chart" className="opacity-70 hover:opacity-100 underline-offset-2 hover:underline"> · add your city for Moon &amp; Rising →</a>}
          </>
        ) : (
          <><span className="tok-com">// </span>we'll detect your sign</>
        )}
      </p>
    </div>
  );
}
