import { useEffect, useState } from "react";
import { getUserName, setUserName, timeGreeting, getLastSign, hasVisited, markVisited } from "@/lib/user";
import { getZodiacByKey, ZodiacKey } from "@/data/zodiacs";
import { Pencil, Check, X } from "lucide-react";

interface Props {
  currentSign: ZodiacKey;
}

export default function GreetingBar({ currentSign }: Props) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [returningSign, setReturningSign] = useState<ZodiacKey | null>(null);

  useEffect(() => {
    const n = getUserName();
    setName(n);
    setDraft(n);
    if (hasVisited()) {
      const last = getLastSign();
      if (last && last !== currentSign) setReturningSign(last);
    }
    markVisited();
    if (!n) {
      // gently prompt for a name on first visit
      setEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const returning = returningSign ? getZodiacByKey(returningSign) : null;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-sm md:text-base text-muted-foreground">
          {greeting}
          {name ? <>, <span className="text-foreground font-medium">{name}</span></> : null}
          <span className="opacity-60"> · Here's your insight for today.</span>
        </p>

        {!editing ? (
          <button
            onClick={() => { setDraft(name); setEditing(true); }}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth rounded-full px-2.5 py-1 border hairline focus-ring"
            aria-label={name ? "Edit your name" : "Add your name"}
          >
            <Pencil className="w-3 h-3" />
            {name ? "Edit name" : "Add name"}
          </button>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); save(); }}
            className="inline-flex items-center gap-1 rounded-full border hairline bg-surface pl-3 pr-1 py-0.5"
          >
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your name"
              maxLength={40}
              className="bg-transparent outline-none text-sm w-32"
              aria-label="Your name"
            />
            <button type="submit" className="grid place-items-center w-7 h-7 rounded-full hover:bg-secondary focus-ring" aria-label="Save name">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={cancel} className="grid place-items-center w-7 h-7 rounded-full hover:bg-secondary focus-ring" aria-label="Cancel">
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {returning && (
        <p className="mt-2 text-xs text-muted-foreground animate-fade-in">
          Welcome back — your last sign was{" "}
          <span className="text-foreground">{returning.symbol} {returning.name}</span>.
        </p>
      )}
    </div>
  );
}
