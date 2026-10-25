import { useEffect, useRef, useState } from "react";
import { ZodiacSign } from "@/data/zodiacs";
import { Horoscope } from "@/lib/horoscope";
import { Download, Copy, Check, X, Share2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  sign: ZodiacSign;
  horoscope: Horoscope;
}

export default function ShareCard({ open, onClose, sign, horoscope }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const fileName = `zodiac-insight-${sign.key}.png`;
  const shareText = `${sign.name} · ${horoscope.oneLiner} — Zodiac Insight`;
  // Native share sheet on touch devices; desktop keeps Copy. Probed with an empty file; the real one is made on click.
  const canShareFiles = window.matchMedia("(pointer: coarse)").matches && !!navigator.canShare?.({
    files: [new File([], fileName, { type: "image/png" })],
  });

  // Escape closes; lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // Wait for web fonts so the card isn't drawn in fallback fonts.
    document.fonts.ready.then(() => { if (!cancelled) draw(); });
    return () => { cancelled = true; };

    function draw() {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = 1080, H = 1350;
      c.width = W * dpr;
      c.height = H * dpr;
      c.style.aspectRatio = `${W} / ${H}`;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const isDark = document.documentElement.classList.contains("dark");
      const bg = isDark ? "#16131f" : "#fbfaff";
      const fg = isDark ? "#f3f2f8" : "#1f1c2b";
      const muted = isDark ? "#a7a3b8" : "#67637a";
      const accent = `hsl(${sign.hue}, 70%, 60%)`;

      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Soft accent glow
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.15, 50, W * 0.5, H * 0.15, 700);
      grad.addColorStop(0, `hsla(${sign.hue}, 70%, 60%, 0.35)`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Hairline frame
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(48, 48, W - 96, H - 96);

      // Brand top
      ctx.fillStyle = muted;
      ctx.font = "500 24px 'Geist Mono', ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText("zodiac.insight_", 96, 130);

      ctx.textAlign = "right";
      ctx.fillText(horoscope.date.toUpperCase(), W - 96, 130);

      // Symbol
      ctx.textAlign = "center";
      ctx.fillStyle = accent;
      ctx.font = "280px 'Segoe UI Symbol', 'Apple Symbols', 'Noto Sans Symbols 2', sans-serif";
      ctx.fillText(sign.symbol, W / 2, 480);

      // Name
      ctx.fillStyle = fg;
      ctx.font = "600 96px Geist, system-ui, sans-serif";
      ctx.fillText(sign.name, W / 2, 600);

      // Tagline
      ctx.fillStyle = muted;
      ctx.font = "400 26px Geist, system-ui, sans-serif";
      ctx.fillText(`${sign.element} · ${sign.tagline}`, W / 2, 650);

      // One-liner (wrap)
      ctx.fillStyle = fg;
      ctx.font = "500 44px Geist, system-ui, sans-serif";
      wrapText(ctx, `"${horoscope.oneLiner}"`, W / 2, 800, W - 240, 60);

      // Mood ring
      const cx = W / 2, cy = 1080, r = 90;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (horoscope.mood / 100) * Math.PI * 2);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.fillStyle = fg;
      ctx.font = "400 56px Geist, system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(String(horoscope.mood), cx, cy);
      ctx.textBaseline = "alphabetic";

      ctx.fillStyle = muted;
      ctx.font = "500 18px Geist, system-ui, sans-serif";
      ctx.fillText("MOOD", cx, cy + 130);

      // Footer
      ctx.fillStyle = muted;
      ctx.font = "400 22px Geist, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Lucky · ${horoscope.luckyNumber}  ·  ${horoscope.luckyColor}`, 96, H - 110);
      ctx.textAlign = "right";
      ctx.fillText("zodiac-insight", W - 96, H - 110);
    }
  }, [open, sign, horoscope]);

  const toBlob = () =>
    new Promise<Blob | null>((resolve) => {
      const c = canvasRef.current;
      if (!c) return resolve(null);
      c.toBlob(resolve, "image/png");
    });

  const download = async () => {
    const blob = await toBlob();
    if (!blob) return toast.error("Couldn't create the image.");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    // Revoking synchronously can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    toast.success("Card downloaded");
  };

  const markCopied = (msg: string) => {
    setCopied(true);
    toast.success(msg);
    setTimeout(() => setCopied(false), 1500);
  };

  const copy = async () => {
    const blob = await toBlob();
    try {
      if (!blob) throw new Error("no image");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      markCopied("Image copied to clipboard");
    } catch {
      try {
        await navigator.clipboard.writeText(shareText);
        markCopied("Text copied to clipboard");
      } catch {
        toast.error("Couldn't copy. Try Download instead.");
      }
    }
  };

  const share = async () => {
    const blob = await toBlob();
    if (!blob) return toast.error("Couldn't create the image.");
    try {
      await navigator.share({ files: [new File([blob], fileName, { type: "image/png" })], text: shareText });
    } catch (e) {
      // AbortError = user closed the share sheet; not an error.
      if ((e as Error).name !== "AbortError") toast.error("Couldn't open sharing. Try Download instead.");
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share your reading"
      className="fixed inset-0 z-50 grid place-items-center p-4 overflow-y-auto overscroll-contain bg-background/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md surface rounded-xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Share</div>
            <div className="display text-xl">Your card</div>
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center w-9 h-9 rounded-md border hairline hover:bg-accent focus-ring"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-xl overflow-hidden border hairline bg-secondary/30">
          {/* Cap height so the buttons stay on screen on short phones */}
          <canvas ref={canvasRef} className="block mx-auto max-w-full h-auto max-h-[60dvh]" role="img" aria-label={`${sign.name} reading card`} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {canShareFiles ? (
            <button
              onClick={share}
              className="inline-flex items-center justify-center gap-2 h-11 rounded-md border hairline hover:bg-accent text-sm focus-ring transition-smooth"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          ) : (
          <button
            onClick={copy}
            className="inline-flex items-center justify-center gap-2 h-11 rounded-md border hairline hover:bg-accent text-sm focus-ring transition-smooth"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          )}
          <button
            onClick={download}
            className="btn-primary px-3 text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + " ";
    const metrics = ctx.measureText(test);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, yy);
      line = words[n] + " ";
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yy);
}
