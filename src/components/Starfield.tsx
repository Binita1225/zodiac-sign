import { useEffect, useRef } from "react";

interface Star { x: number; y: number; r: number; a: number; speed: number; phase: number; depth: number; tint: boolean }
interface Meteor { x: number; y: number; vx: number; vy: number; age: number; ttl: number; len: number; width: number; tint: 0 | 1 | 2 }

// Full-page canvas starfield: soft twinkle, slight scroll parallax and shooting stars —
// a gentle meteor shower while the hero is in view, only the occasional one further down.
// Static under prefers-reduced-motion; paused while the tab is hidden.
export default function Starfield({ hue, dark }: { hue: number; dark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef(hue);
  hueRef.current = hue;

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, stars: Star[] = [], meteors: Meteor[] = [];
    let nextMeteor = performance.now() + 600, raf = 0, last = 0;

    // The meteor shower runs only while the hero is on screen below the navbar; once it has
    // scrolled away, fall back to the occasional shooting star.
    const hero = document.getElementById("hero");
    let inHero = !!hero;
    const heroObserver = new IntersectionObserver(([e]) => {
      inHero = e.isIntersecting;
      if (!inHero) nextMeteor = performance.now() + 6000 + Math.random() * 8000;
    }, { rootMargin: "-80px 0px 0px 0px" });
    if (hero) heroObserver.observe(hero);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // ponytail: density by screen area, capped so phones stay cheap.
      const n = Math.min(320, Math.round((w * h) / 6500));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() ** 2.2 * 1.5 + 0.35,
        a: Math.random() * 0.6 + 0.25,
        speed: Math.random() * 1.6 + 0.4, phase: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.8 + 0.2, tint: Math.random() < 0.18,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const scroll = window.scrollY;
      for (const s of stars) {
        const tw = reduce ? 1 : 0.6 + 0.4 * Math.sin((t / 1000) * s.speed + s.phase);
        const alpha = s.a * tw * (dark ? 1 : 0.45);
        const y = (((s.y - scroll * 0.04 * s.depth) % h) + h) % h;
        ctx.fillStyle = s.tint ? `hsla(${hueRef.current}, 85%, ${dark ? 78 : 45}%, ${alpha})` : dark ? `rgba(236, 233, 255, ${alpha})` : `rgba(70, 55, 130, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.35 && dark) {
          // Tiny cross glint on the brightest stars.
          ctx.strokeStyle = `rgba(236, 233, 255, ${alpha * 0.35})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3, y); ctx.lineTo(s.x + s.r * 3, y);
          ctx.moveTo(s.x, y - s.r * 3); ctx.lineTo(s.x, y + s.r * 3);
          ctx.stroke();
        }
      }

      if (reduce) return;
      // Time step in 60 fps "frames", so meteors look the same on 60/120/144 Hz screens.
      const dt = last ? Math.min(3, (t - last) / (1000 / 60)) : 1;
      last = t;
      if (t > nextMeteor && meteors.length < (inHero ? 6 : 1)) {
        // A meteor shower over the hero: enter along the top edge and fall down-left, mostly at
        // shallow angles (crossing the open sky under the navbar), sometimes steeper.
        const angle = Math.PI * (Math.random() < 0.7 ? 0.07 + Math.random() * 0.1 : 0.18 + Math.random() * 0.1);
        const speed = 9 + Math.random() * 8;
        const roll = Math.random();
        meteors.push({
          x: w * (0.2 + Math.random() * 1.0), y: h * (Math.random() * (inHero ? 0.28 : 0.3) - 0.04),
          vx: -Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          age: 0, ttl: 60 + Math.random() * 40, len: 16 + Math.random() * 10,
          width: 2.2 + Math.random() * 1.2,
          tint: roll < 0.5 ? 0 : roll < 0.75 ? 1 : 2, // white, sign colour, violet
        });
        nextMeteor = t + (inHero ? 250 + Math.random() * 450 : 6000 + Math.random() * 8000);
      }
      meteors = meteors.filter((m) => {
        m.age += dt;
        m.x += m.vx * dt; m.y += m.vy * dt;
        // Quick fade-in, full brightness for most of the flight, short fade-out.
        const life = Math.min(1, m.age / 6) * Math.max(0, Math.min(1, (m.ttl - m.age) / 18));
        const tx = m.x - m.vx * m.len, ty = m.y - m.vy * m.len;
        const head = m.tint === 1 ? `hsla(${hueRef.current}, 95%, 82%,` : m.tint === 2 ? "hsla(270, 95%, 85%," : "rgba(255, 255, 255,";
        const tail = ctx.createLinearGradient(m.x, m.y, tx, ty);
        tail.addColorStop(0, `${head} ${life})`);
        tail.addColorStop(0.25, `${head} ${0.5 * life})`);
        tail.addColorStop(1, `${head} 0)`);
        ctx.strokeStyle = tail;
        ctx.lineCap = "round";
        // Soft bloom underneath, then the crisp streak on top.
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = m.width * 3.5;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = m.width;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        // Glowing head with a bright core.
        const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 14);
        glow.addColorStop(0, `${head} ${0.9 * life})`);
        glow.addColorStop(1, `${head} 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${life})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 0.85, 0, Math.PI * 2);
        ctx.fill();
        return m.age < m.ttl && m.x > -200 && m.y < h + 200;
      });
    };

    const loop = (t: number) => { draw(t); raf = requestAnimationFrame(loop); };
    const start = () => { cancelAnimationFrame(raf); if (reduce) draw(0); else raf = requestAnimationFrame(loop); };
    const onVisibility = () => { last = 0; if (document.hidden) cancelAnimationFrame(raf); else start(); };
    const onResize = () => { resize(); start(); };
    const onScroll = () => { if (reduce) draw(0); };

    resize();
    start();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      heroObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [dark]);

  return <canvas ref={ref} aria-hidden className="fixed inset-0 w-full h-full pointer-events-none" />;
}
