'use client';

import { useEffect, useRef } from 'react';
import { type BurstOptions, prefersReducedMotion, registerFx } from '@/features/fx/fx.lib';

type Ripple = {
  x: number;
  y: number;
  start: number;
  strength: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  spin: number;
  rot: number;
  confetti: boolean;
};

const SPACING = 28;
const CURSOR_RADIUS = 150;
const RIPPLE_SPEED = 0.9; // px per ms
const RIPPLE_BAND = 70;
const RIPPLE_LIFE = 1400;
const MAX_PARTICLES = 600;

function readColors() {
  const s = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    dot: get('--fx-dot', 'rgba(255,255,255,0.14)'),
    accent: get('--fx-accent', '#c6ff3d'),
    palette: [
      get('--fx-accent', '#c6ff3d'),
      get('--fx-pink', '#ff4fa3'),
      get('--fx-cyan', '#38e1ff'),
      get('--fx-amber', '#ffc83d'),
      get('--fx-violet', '#a970ff'),
    ],
  };
}

/** Dot field behind the content, plus particles and confetti drawn above it. Driven through `fx` in fx.lib. */
export function FxCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const fg = fgRef.current;
    if (!canvas || !fg) return;
    const ctx = canvas.getContext('2d');
    const fctx = fg.getContext('2d');
    if (!ctx || !fctx) return;

    const reduced = prefersReducedMotion();
    const colors = readColors();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let rainbowUntil = 0;
    const pointer = { x: -9999, y: -9999, active: false };
    const ripples: Ripple[] = [];
    const particles: Particle[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      for (const [c, cx] of [
        [canvas, ctx],
        [fg, fctx],
      ] as const) {
        c.width = width * dpr;
        c.height = height * dpr;
        c.style.width = `${width}px`;
        c.style.height = `${height}px`;
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      if (reduced) draw(performance.now());
    };

    const spawn = (x: number, y: number, opts: BurstOptions & { confetti?: boolean } = {}) => {
      if (reduced) return;
      const { count = 14, spread = 5, colors: palette = colors.palette, confetti = false } = opts;
      for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.4 + Math.random()) * spread;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (confetti ? 0 : 1.5),
          life: 0,
          max: confetti ? 260 + Math.random() * 120 : 40 + Math.random() * 30,
          size: confetti ? 5 + Math.random() * 5 : 3 + Math.random() * 3,
          color: palette[Math.floor(Math.random() * palette.length)],
          spin: (Math.random() - 0.5) * 0.3,
          rot: Math.random() * Math.PI,
          confetti,
        });
      }
    };

    registerFx({
      ripple: (x, y, strength = 1) => {
        if (reduced) return;
        ripples.push({ x, y, start: performance.now(), strength });
        if (ripples.length > 8) ripples.shift();
      },
      burst: (x, y, opts) => spawn(x, y, opts),
      confetti: (count = 160) => {
        if (reduced) return;
        for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
          particles.push({
            x: Math.random() * width,
            y: -20 - Math.random() * height * 0.5,
            vx: (Math.random() - 0.5) * 2,
            vy: 1.5 + Math.random() * 3,
            life: 0,
            max: 320 + Math.random() * 120,
            size: 6 + Math.random() * 6,
            color: colors.palette[Math.floor(Math.random() * colors.palette.length)],
            spin: (Math.random() - 0.5) * 0.3,
            rot: Math.random() * Math.PI,
            confetti: true,
          });
        }
      },
      rainbow: (ms) => {
        rainbowUntil = performance.now() + ms;
      },
    });

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const rainbow = now < rainbowUntil;
      const scrollOffset = (window.scrollY * 0.15) % SPACING;

      // Expire ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].start > RIPPLE_LIFE) ripples.splice(i, 1);
      }

      // Dot field
      for (let gx = SPACING / 2; gx < width + SPACING; gx += SPACING) {
        for (let gy = SPACING / 2 - scrollOffset; gy < height + SPACING; gy += SPACING) {
          let x = gx;
          let y = gy;
          let glow = 0;

          if (pointer.active) {
            const dx = gx - pointer.x;
            const dy = gy - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < CURSOR_RADIUS) {
              const f = 1 - d / CURSOR_RADIUS;
              glow = Math.max(glow, f * f);
              x += (dx / (d || 1)) * f * 10;
              y += (dy / (d || 1)) * f * 10;
            }
          }

          for (const r of ripples) {
            const age = now - r.start;
            const radius = age * RIPPLE_SPEED;
            const dx = gx - r.x;
            const dy = gy - r.y;
            const d = Math.hypot(dx, dy);
            const off = Math.abs(d - radius);
            if (off < RIPPLE_BAND) {
              const fade = 1 - age / RIPPLE_LIFE;
              const f = (1 - off / RIPPLE_BAND) * fade * r.strength;
              glow = Math.max(glow, f);
              x += (dx / (d || 1)) * f * 14;
              y += (dy / (d || 1)) * f * 14;
            }
          }

          if (rainbow) {
            const hue = (gx * 0.4 + gy * 0.4 - now * 0.25) % 360;
            ctx.fillStyle = `hsla(${hue}, 95%, 62%, ${0.35 + glow * 0.65})`;
            const s = 2 + glow * 3;
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
          } else if (glow > 0.02) {
            ctx.globalAlpha = Math.min(1, 0.2 + glow);
            ctx.fillStyle = colors.accent;
            const s = 2 + glow * 3;
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
            ctx.globalAlpha = 1;
          } else {
            ctx.fillStyle = colors.dot;
            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        }
      }

      // Particles (foreground canvas, above content)
      fctx.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life > p.max || p.y > height + 40) {
          particles.splice(i, 1);
          continue;
        }
        if (p.confetti) {
          p.vx += Math.sin((p.life + i) * 0.05) * 0.03;
          p.vy = Math.min(p.vy + 0.05, 3.2);
          p.vx *= 0.99;
        } else {
          p.vy += 0.18;
          p.vx *= 0.97;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.spin;

        const alpha = p.confetti ? Math.min(1, (p.max - p.life) / 40) : 1 - p.life / p.max;
        fctx.globalAlpha = alpha;
        fctx.fillStyle = p.color;
        if (p.confetti) {
          fctx.save();
          fctx.translate(p.x, p.y);
          fctx.rotate(p.rot);
          fctx.scale(1, Math.cos(p.life * 0.15));
          fctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          fctx.restore();
        } else {
          fctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
      }
      fctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };
    const onScroll = () => {
      if (reduced) draw(performance.now());
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('scroll', onScroll, { passive: true });

    if (reduced) draw(performance.now());
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      registerFx(null);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-0" />
      <canvas ref={fgRef} aria-hidden className="pointer-events-none fixed inset-0 z-70" />
    </>
  );
}
