import { useState } from "react";
import { getZodiacFromDate, ZodiacSign } from "@/data/zodiacs";
import { Calendar } from "lucide-react";

export default function DateOfBirthInput({ onDetect }: { onDetect: (sign: ZodiacSign) => void }) {
  const [value, setValue] = useState("");
  const [detected, setDetected] = useState<ZodiacSign | null>(null);

  const handle = (v: string) => {
    setValue(v);
    if (!v) { setDetected(null); return; }
    const d = new Date(v);
    if (isNaN(d.getTime())) return;
    const z = getZodiacFromDate(d);
    setDetected(z);
    onDetect(z);
  };

  return (
    <div className="surface rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <span className="grid place-items-center w-10 h-10 rounded-full bg-secondary">
          <Calendar className="w-4 h-4" />
        </span>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Date of birth</div>
          <input
            type="date"
            value={value}
            onChange={(e) => handle(e.target.value)}
            className="bg-transparent outline-none text-base w-full mt-0.5"
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {detected ? (
          <span>Detected <span className="text-foreground font-medium">{detected.symbol} {detected.name}</span></span>
        ) : (
          <span>We'll detect your sign automatically</span>
        )}
      </div>
    </div>
  );
}
