'use client';

import { useEffect, useRef } from 'react';
import { type BurstOptions, prefersReducedMotion, registerFx } from '@/features/fx/fx.lib';

type Ripple = { x: number; y: number; start: number; strength: number };

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
const PARALLAX = 0.15;

function readColors() {
  const s = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  const accent = get('--fx-accent', '#c6ff3d');
  return {
    dot: get('--fx-dot', 'rgba(255,255,255,0.11)'),
    accent,
    palette: [
      accent,
      get('--fx-pink', '#ff5fae'),
      get('--fx-cyan', '#4fe3ff'),
      get('--fx-amber', '#ffc83d'),
      get('--fx-violet', '#a98bff'),
    ],
  };
}

/**
 * Two fixed canvases: a dot field behind the content and particles/confetti above it, driven through
 * `fx` in fx.lib. Frames are drawn on demand only: the loop stops whenever nothing is moving, the dot
 * layer redraws only when the pointer, scroll or a ripple changed it, and the particle layer only while
 * particles exist. An idle page costs nothing.
 */
export function FxCanvas() {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const bg = bgRef.current?.getContext('2d');
    const fg = fgRef.current?.getContext('2d');
    if (!bg || !fg) return;

    const reduced = prefersReducedMotion();
    const colors = readColors();
    const pointer = { x: 0, y: 0, active: false };
    const ripples: Ripple[] = [];
    const particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let rainbowUntil = 0;
    let raf = 0;
    let dotsDirty = true;
    let dotsWereAnimating = false;
    let particlesOnScreen = false;

    const schedule = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const invalidateDots = () => {
      dotsDirty = true;
      schedule();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      for (const ctx of [bg, fg]) {
        ctx.canvas.width = width * dpr;
        ctx.canvas.height = height * dpr;
        ctx.canvas.style.width = `${width}px`;
        ctx.canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      invalidateDots();
    };

    const drawDots = (now: number) => {
      bg.clearRect(0, 0, width, height);
      const rainbow = now < rainbowUntil;
      const offset = (window.scrollY * PARALLAX) % SPACING;

      for (let gx = SPACING / 2; gx < width + SPACING; gx += SPACING) {
        for (let gy = SPACING / 2 - offset; gy < height + SPACING; gy += SPACING) {
          let x = gx;
          let y = gy;
          let glow = 0;

          if (pointer.active) {
            const dx = gx - pointer.x;
            const dy = gy - pointer.y;
            // Cheap box test before the square root: most dots are far from the cursor.
            if (Math.abs(dx) < CURSOR_RADIUS && Math.abs(dy) < CURSOR_RADIUS) {
              const d = Math.hypot(dx, dy);
              if (d < CURSOR_RADIUS) {
                const f = 1 - d / CURSOR_RADIUS;
                glow = f * f;
                x += (dx / (d || 1)) * f * 10;
                y += (dy / (d || 1)) * f * 10;
              }
            }
          }

          for (const r of ripples) {
            const age = now - r.start;
            const dx = gx - r.x;
            const dy = gy - r.y;
            const d = Math.hypot(dx, dy);
            const off = Math.abs(d - age * RIPPLE_SPEED);
            if (off < RIPPLE_BAND) {
              const f = (1 - off / RIPPLE_BAND) * (1 - age / RIPPLE_LIFE) * r.strength;
              glow = Math.max(glow, f);
              x += (dx / (d || 1)) * f * 14;
              y += (dy / (d || 1)) * f * 14;
            }
          }

          if (rainbow) {
            const hue = (gx * 0.4 + gy * 0.4 - now * 0.25) % 360;
            bg.fillStyle = `hsla(${hue}, 95%, 62%, ${0.35 + glow * 0.65})`;
            const s = 2 + glow * 3;
            bg.fillRect(x - s / 2, y - s / 2, s, s);
          } else if (glow > 0.02) {
            bg.globalAlpha = Math.min(1, 0.2 + glow);
            bg.fillStyle = colors.accent;
            const s = 2 + glow * 3;
            bg.fillRect(x - s / 2, y - s / 2, s, s);
            bg.globalAlpha = 1;
          } else {
            bg.fillStyle = colors.dot;
            bg.fillRect(x - 1, y - 1, 2, 2);
          }
        }
      }
    };

    const drawParticles = () => {
      fg.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life > p.max || p.y > height + 40) {
          // Swap-remove: order doesn't matter, and splice would shift the whole array.
          particles[i] = particles[particles.length - 1];
          particles.pop();
          continue;
        }
        if (p.confetti) {
          p.vx = (p.vx + Math.sin((p.life + i) * 0.05) * 0.03) * 0.99;
          p.vy = Math.min(p.vy + 0.05, 3.2);
        } else {
          p.vy += 0.18;
          p.vx *= 0.97;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.spin;

        fg.globalAlpha = p.confetti ? Math.min(1, (p.max - p.life) / 40) : 1 - p.life / p.max;
        fg.fillStyle = p.color;
        if (p.confetti) {
          fg.save();
          fg.translate(p.x, p.y);
          fg.rotate(p.rot);
          fg.scale(1, Math.cos(p.life * 0.15));
          fg.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          fg.restore();
        } else {
          fg.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
      }
      fg.globalAlpha = 1;
    };

    function frame(now: number) {
      raf = 0;

      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].start > RIPPLE_LIFE) ripples.splice(i, 1);
      }
      const dotsAnimating = ripples.length > 0 || now < rainbowUntil;
      // `dotsWereAnimating` buys one clean frame after the last ripple/rainbow, so no glow is left behind.
      if (dotsDirty || dotsAnimating || dotsWereAnimating) drawDots(now);
      dotsDirty = false;
      dotsWereAnimating = dotsAnimating;

      if (particles.length > 0 || particlesOnScreen) {
        drawParticles();
        particlesOnScreen = particles.length > 0;
      }

      if (dotsAnimating || particles.length > 0) schedule();
    }

    const spawn = (x: number, y: number, opts: BurstOptions = {}) => {
      if (reduced) return;
      const { count = 14, spread = 5, colors: palette = colors.palette } = opts;
      for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.4 + Math.random()) * spread;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          life: 0,
          max: 40 + Math.random() * 30,
          size: 3 + Math.random() * 3,
          color: palette[Math.floor(Math.random() * palette.length)],
          spin: 0,
          rot: 0,
          confetti: false,
        });
      }
      schedule();
    };

    registerFx({
      ripple: (x, y, strength = 1) => {
        if (reduced) return;
        ripples.push({ x, y, start: performance.now(), strength });
        if (ripples.length > 8) ripples.shift();
        schedule();
      },
      burst: spawn,
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
        schedule();
      },
      rainbow: (ms) => {
        rainbowUntil = performance.now() + ms;
        schedule();
      },
    });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      invalidateDots();
    };
    const onLeave = () => {
      pointer.active = false;
      invalidateDots();
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        invalidateDots();
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', invalidateDots, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      registerFx(null);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', invalidateDots);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <>
      <canvas ref={bgRef} aria-hidden className="pointer-events-none fixed inset-0 z-0" />
      <canvas ref={fgRef} aria-hidden className="pointer-events-none fixed inset-0 z-70" />
    </>
  );
}
