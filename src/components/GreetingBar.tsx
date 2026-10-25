import { useEffect, useState } from "react";
import { getUserName, setUserName, timeGreeting, getLastSign, hasVisited, markVisited, touchStreak } from "@/lib/user";
import { getZodiacByKey, ZodiacKey } from "@/data/zodiacs";
import { Pencil, Check, X, Flame } from "lucide-react";

interface Props {
  currentSign: ZodiacKey;
}

export default function GreetingBar({ currentSign }: Props) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [focusOnEdit, setFocusOnEdit] = useState(false);
  const [draft, setDraft] = useState("");
  const [returningSign, setReturningSign] = useState<ZodiacKey | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const n = getUserName();
    setName(n);
    setDraft(n);
    if (hasVisited()) {
      const last = getLastSign();
      if (last) setReturningSign(last);
    }
    markVisited();
    setStreak(touchStreak());
    if (!n) {
      // gently prompt for a name on first visit
      setEditing(true);
    }
  }, []);

  const save = () => {
    const trimmed = draft.trim().slice(0, 40);
    setUserName(trimmed);
    setName(trimmed);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(name);
    setEditing(false);
  };

  const greeting = timeGreeting();
  // Only while they're still on the sign we restored for them.
  const returning = returningSign === currentSign ? getZodiacByKey(returningSign) : null;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-base text-muted-foreground">
          {greeting}
          {name ? <>, <span className="text-foreground font-medium">{name}</span></> : null}
          <span className="opacity-70">.</span>
        </p>

        {!editing ? (
          <button
            onClick={() => { setDraft(name); setFocusOnEdit(true); setEditing(true); }}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth rounded-md px-2.5 py-1 border hairline focus-ring"
            aria-label={name ? "Edit your name" : "Add your name"}
          >
            <Pencil className="w-3 h-3" />
            {name ? "Edit name" : "Add name"}
          </button>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); save(); }}
            className="inline-flex items-center gap-1 rounded-md border hairline bg-surface pl-3 pr-1 py-0.5"
          >
            <input
              autoFocus={focusOnEdit}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your name"
              maxLength={40}
              className="bg-transparent outline-none text-base md:text-sm w-32"
              aria-label="Your name"
            />
            <button type="submit" className="grid place-items-center w-8 h-8 rounded-md hover:bg-accent focus-ring" aria-label="Save name">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={cancel} className="grid place-items-center w-8 h-8 rounded-md hover:bg-accent focus-ring" aria-label="Cancel">
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {streak > 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Flame className={`w-3.5 h-3.5 ${streak > 1 ? "text-orange-400" : ""}`} />
          {streak > 1
            ? <><span className="text-foreground tabular-nums">{streak}-day</span> streak — see you tomorrow</>
            : "day 1 — come back tomorrow to start a streak"}
        </p>
      )}

      {returning && (
        <p className="mt-2 font-mono text-xs text-muted-foreground animate-fade-in"><span className="tok-com">// </span>
          Welcome back — picking up where you left off with{" "}
          <span className="text-foreground"><span className="glyph">{returning.symbol}</span> {returning.name}</span>.
        </p>
      )}
    </div>
  );
}
