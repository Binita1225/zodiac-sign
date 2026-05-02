import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function DesignPhilosophy() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border hairline bg-surface/50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-sm focus-ring rounded-2xl"
        aria-expanded={open}
      >
        <span className="text-muted-foreground">
          <span className="text-foreground">Design philosophy</span> · built with care
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-5 text-sm text-muted-foreground leading-relaxed animate-fade-in space-y-3">
          <p>
            Zodiac Insight is a study in restraint. The interface is built around a single
            premise: the cosmos rewards attention, not noise. Every animation, every
            hairline border, every word — chosen to be small enough to disappear.
          </p>
          <p className="text-foreground/80">
            Built with React, Tailwind, and a quiet obsession with type and timing.
          </p>
          <p className="text-xs">
            Focus: minimal UX · performance · calm interaction.
          </p>
        </div>
      )}
    </div>
  );
}
