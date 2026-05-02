import { useEffect, useRef, useState } from "react";
import { ZodiacSign } from "@/data/zodiacs";
import { Horoscope } from "@/lib/horoscope";
import { Download, Copy, Check, X } from "lucide-react";
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

  useEffect(() => {
    if (!open) return;
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
    const bg = isDark ? "#0b0c14" : "#faf7f1";
    const fg = isDark ? "#efeadf" : "#16182a";
    const muted = isDark ? "#8a8b97" : "#6b6e7a";
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
    ctx.font = "500 22px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("ZODIAC INSIGHT", 96, 130);

    ctx.textAlign = "right";
    ctx.fillText(horoscope.date.toUpperCase(), W - 96, 130);

    // Symbol
    ctx.textAlign = "center";
    ctx.fillStyle = accent;
    ctx.font = "300 280px 'Fraunces', Georgia, serif";
    ctx.fillText(sign.symbol, W / 2, 480);

    // Name
    ctx.fillStyle = fg;
    ctx.font = "400 96px 'Fraunces', Georgia, serif";
    ctx.fillText(sign.name, W / 2, 600);

    // Tagline
    ctx.fillStyle = muted;
    ctx.font = "400 26px Inter, system-ui, sans-serif";
    ctx.fillText(`${sign.element} · ${sign.tagline}`, W / 2, 650);

    // One-liner (wrap)
    ctx.fillStyle = fg;
    ctx.font = "400 44px 'Fraunces', Georgia, serif";
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
    ctx.font = "400 56px 'Fraunces', Georgia, serif";
    ctx.textBaseline = "middle";
    ctx.fillText(String(horoscope.mood), cx, cy);
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = muted;
    ctx.font = "500 18px Inter, sans-serif";
    ctx.fillText("MOOD", cx, cy + 130);

    // Footer
    ctx.fillStyle = muted;
    ctx.font = "400 22px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Lucky · ${horoscope.luckyNumber}  ·  ${horoscope.luckyColor}`, 96, H - 110);
    ctx.textAlign = "right";
    ctx.fillText("zodiac-insight", W - 96, H - 110);
  }, [open, sign, horoscope]);

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zodiac-insight-${sign.key}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Card downloaded");
    }, "image/png");
  };

  const copy = async () => {
    const c = canvasRef.current;
    if (!c) return;
    try {
      c.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await (navigator.clipboard as Clipboard).write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          toast.success("Image copied to clipboard");
          setTimeout(() => setCopied(false), 1500);
        } catch {
          await navigator.clipboard.writeText(`${sign.name} · ${horoscope.oneLiner} — Zodiac Insight`);
          setCopied(true);
          toast.success("Text copied to clipboard");
          setTimeout(() => setCopied(false), 1500);
        }
      }, "image/png");
    } catch {
      toast.error("Couldn't copy.");
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share your reading"
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md surface rounded-3xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Share</div>
            <div className="display text-xl">Your card</div>
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center w-9 h-9 rounded-full border hairline hover:bg-secondary focus-ring"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden border hairline bg-secondary/30">
          <canvas ref={canvasRef} className="w-full h-auto block" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={copy}
            className="inline-flex items-center justify-center gap-2 h-11 rounded-full border hairline hover:bg-secondary text-sm focus-ring transition-smooth"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={download}
            className="inline-flex items-center justify-center gap-2 h-11 rounded-full bg-foreground text-background text-sm hover:opacity-90 focus-ring transition-smooth"
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
