'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { PixelArt } from '@/components/pixel-art';
import { clampX, GRAVITY, launch, type Platform, pickLanding, platformUnder } from '@/features/bot/site-bot.lib';
import { fx } from '@/features/fx/fx.lib';
import { play } from '@/features/sound/sound.lib';
import type { Sprite } from '@/lib/pixel-art';

const pad = (sprite: Sprite): Sprite => sprite.map((row) => row.padEnd(16, '.'));

/** Faces right (blaster arm on the right); mirrored when facing left. The visor is left dark for the eyes. */
const MECH = pad([
  '....kkkkkk',
  '...kyyyyyyk',
  '..kyyyyyyyyk',
  '..kykkkkkkyk',
  '..kykkkkkkyk',
  '..kykkkkkkyk',
  '..kyyyyyyyyk',
  '...kYYYYYYk.kkk',
  '..kyyyyyyyykpwck',
  '.kYkyyyyyykkkkk',
  '.kYkyyppyyk',
  '..kkyyyyyyk',
  '...kYYYYYYk',
  '...kkk..kkk',
  '..kyyk..kyyk',
  '..kkkk..kkkk',
]);

/** Scorch mark left on whatever a stray shot hits. */
const CRACK = pad([
  '',
  '.......k',
  '......kk...k',
  '..k...k...kk',
  '...k.kgk.kk',
  '....kgegkk',
  '..kkgeyegk',
  '.k..kgeegkkk',
  '....kkgekk..k',
  '...kk.kgk',
  '..k....kk',
  '.......k.k',
  '......k...k',
]);

const LINES = {
  poke: ['Ow! Truce?', 'Okay okay, truce.', 'Beep. Ceasefire.'],
  relax: ['♪ ~', 'Patrolling…', 'All clear.', 'Bored. Come back?'],
  hit: ['Gotcha!', 'Bullseye!', 'Pew pew!'],
};
const pickLine = (list: string[]) => list[Math.floor(Math.random() * list.length)];

// shortcut: any bordered, rounded box inside <main> is ground; tag elements with data-ground / data-no-ground to tune.
const CARD = '[class*="rounded-"][class*="border"]';
const GROUND = `main ${CARD}, [data-ground]`;
const HUD_TOP = 76; // keep clear of the HUD bar
const WALK = 140; // px/s
const RUN = 300;
const CURSOR_MS = 4000; // the cursor counts as "here" this long after it last moved
const STANDOFF = 190; // fighting distance from the cursor
const SHOT_SPEED = 760;
const TRUCE_MS = 8000;
const MAX_DECALS = 20;

type Shot = { x: number; y: number; vx: number; vy: number; range: number; went: number; node: HTMLSpanElement };

// Compares with the last value we wrote (the browser may normalise what it stores in el.style).
const setIfChanged = (el: HTMLElement, prop: 'transform' | 'opacity', value: string) => {
  if (el.dataset[prop] === value) return;
  el.dataset[prop] = value;
  el.style[prop] = value;
};

function scan(): Platform[] {
  const out: Platform[] = [];
  for (const el of document.querySelectorAll(GROUND)) {
    if (el.closest('[data-no-ground]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 40) continue;
    out.push({ left: r.left + window.scrollX, right: r.right + window.scrollX, top: r.top + window.scrollY, el });
  }
  return out;
}

/** A little mech that lives on the page: stands on cards, jumps between them, fights the cursor, patrols when you're away. */
export function SiteBot() {
  const [enabled, setEnabled] = useState(false);
  const [line, setLine] = useState<{ id: number; text: string } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);
  const jetRef = useRef<HTMLSpanElement>(null);
  const shotsRef = useRef<HTMLDivElement>(null);
  const decalsRef = useRef<HTMLDivElement>(null);
  const crackRef = useRef<HTMLDivElement>(null);
  const poke = useRef(() => {});

  useEffect(() => setEnabled(!window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);

  useEffect(() => {
    if (!line) return;
    const t = window.setTimeout(() => setLine(null), 1800);
    return () => window.clearTimeout(t);
  }, [line]);

  useEffect(() => {
    if (!enabled) return;
    const size = window.innerWidth < 640 ? 48 : 64; // 3× / 4× the 16px sprite, so pixels stay crisp
    const half = size / 2;
    const say = (text: string) => setLine({ id: performance.now(), text });

    let plats = scan();
    let byEl = new Map(plats.map((p) => [p.el, p]));
    const rescan = () => {
      plats = scan();
      byEl = new Map(plats.map((p) => [p.el, p]));
    };
    window.addEventListener('resize', rescan);

    const cursor = { x: 0, y: 0, at: Number.NEGATIVE_INFINITY, inside: false };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      cursor.at = performance.now();
      cursor.inside = true;
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) cursor.inside = false;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseout', onLeave);

    const floor = (): Platform => ({
      left: window.scrollX,
      right: window.scrollX + window.innerWidth,
      top: window.scrollY + window.innerHeight - 4,
      el: null,
    });
    const resolve = (el: Element | null) => (el ? byEl.get(el) : floor());
    // The card under the bot (or its jump target) is re-measured every frame: reveals and tilts move it, and a 300ms-old rect makes the bot judder.
    const refresh = (el: Element | null) => {
      const p = el && byEl.get(el);
      if (!p) return;
      const r = el.getBoundingClientRect();
      p.left = r.left + window.scrollX;
      p.right = r.right + window.scrollX;
      p.top = r.top + window.scrollY;
    };

    // Physics and brain state live here, not in React: they change every frame.
    const s = {
      x: window.scrollX + window.innerWidth * 0.8,
      y: window.scrollY + HUD_TOP - size,
      vy: 0,
      dir: -1 as 1 | -1,
      mode: 'fall' as 'ground' | 'jump' | 'fall',
      on: null as Element | null,
      jump: { x0: 0, y0: 0, vx: 0, vy: 0, t: 0, T: 0, to: null as Element | null, tx: 0 },
      landed: 0,
      blinkAt: 0,
      // patrol
      pauseUntil: 0,
      turns: 0,
      // combat
      truceUntil: 0,
      volley: 0,
      nextShot: 0,
      nextVolley: performance.now() + 1500,
      recoilAt: 0,
    };
    const shots: Shot[] = [];

    const land = (p: Platform, now: number) => {
      s.mode = 'ground';
      s.on = p.el;
      s.y = p.top;
      s.vy = 0;
      s.landed = now;
    };

    const jumpTo = (to: Platform, tx: number) => {
      const lx = clampX(to, tx, half);
      // Too far to leap (a long scroll): drop in from the top of the screen instead.
      if (Math.abs(to.top - s.y) > window.innerHeight * 1.2) {
        s.x = lx;
        s.y = window.scrollY + HUD_TOP - size;
      }
      const { vx, vy, T } = launch(lx - s.x, to.top - s.y);
      s.jump = { x0: s.x, y0: s.y, vx, vy, t: 0, T, to: to.el, tx: lx };
      s.mode = 'jump';
      if (Math.abs(vx) > 1) s.dir = vx > 0 ? 1 : -1;
    };

    const walkTo = (tx: number, dt: number, speed?: number) => {
      const d = tx - s.x;
      if (Math.abs(d) < 2) return false;
      s.dir = d > 0 ? 1 : -1;
      s.x += s.dir * Math.min(Math.abs(d), (speed ?? (Math.abs(d) > 220 ? RUN : WALK)) * dt);
      return true;
    };

    // Walk to the edge facing another card (or under/over the landing spot), then jump across.
    const travel = (p: Platform, to: Platform, x: number, dt: number) => {
      const landX = clampX(to, x, half);
      const edge =
        to.left > p.right - half ? p.right - half : to.right < p.left + half ? p.left + half : clampX(p, landX, half);
      const walking = walkTo(edge, dt);
      if (!walking) jumpTo(to, landX);
      return walking;
    };

    poke.current = () => {
      play('toggle');
      s.truceUntil = performance.now() + TRUCE_MS;
      s.volley = 0;
      say(pickLine(LINES.poke));
      const p = s.mode === 'ground' && resolve(s.on);
      if (p) jumpTo(p, s.x);
    };

    // After a scroll, new cards came into view: stop pausing and look around.
    const onScroll = () => {
      s.pauseUntil = Math.min(s.pauseUntil, performance.now() + 450);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Combat ────────────────────────────────────────────────────────────
    const decal = (x: number, y: number, node: HTMLElement, ms: number) => {
      const layer = decalsRef.current;
      if (!layer) return;
      node.style.position = 'absolute';
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      layer.append(node);
      while (layer.childElementCount > MAX_DECALS) layer.firstElementChild?.remove();
      node.animate([{ opacity: 1 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: ms }).onfinish = () =>
        node.remove();
    };

    const damageNumber = (x: number, y: number, text: string) => {
      const n = document.createElement('span');
      n.textContent = text;
      n.className = 'font-pixel text-[11px] text-game-red [text-shadow:2px_2px_0_#000] whitespace-nowrap';
      decal(x - 12, y - 18, n, 900);
      n.animate([{ translate: '0 0' }, { translate: '0 -28px' }], {
        duration: 900,
        easing: 'cubic-bezier(.2,.8,.3,1)',
      });
    };

    const scorch = (x: number, y: number) => {
      const art = crackRef.current?.firstElementChild;
      if (!art) return;
      const wrap = document.createElement('span');
      wrap.style.width = '28px';
      wrap.style.height = '28px';
      wrap.style.margin = '-14px 0 0 -14px';
      wrap.append(art.cloneNode(true));
      decal(x, y, wrap, 7000);
    };

    const fire = (now: number) => {
      const layer = shotsRef.current;
      if (!layer) return;
      const gx = s.x + s.dir * size * 0.4;
      const gy = s.y - size * 0.47;
      const tx = cursor.x + window.scrollX;
      const ty = cursor.y + window.scrollY;
      const dist = Math.hypot(tx - gx, ty - gy);
      // Most shots are aimed true; the rest stray and land somewhere on the page.
      const spread = Math.random() < 0.6 ? 0.03 : 0.28;
      const angle = Math.atan2(ty - gy, tx - gx) + (Math.random() * 2 - 1) * spread;
      const node = document.createElement('span');
      node.className =
        'absolute left-0 top-0 h-1 w-3 -mt-0.5 -ml-1.5 rounded-[1px] bg-game-pink shadow-[0_0_8px_2px_var(--game-pink)]';
      layer.append(node);
      shots.push({
        x: gx,
        y: gy,
        vx: Math.cos(angle) * SHOT_SPEED,
        vy: Math.sin(angle) * SHOT_SPEED,
        range: dist + 60 + Math.random() * 160,
        went: 0,
        node,
      });
      s.recoilAt = now;
      play('click');
    };

    const impact = (shot: Shot) => {
      const cx = shot.x - window.scrollX;
      const cy = shot.y - window.scrollY;
      const hit = document.elementFromPoint(cx, cy);
      fx.burst(cx, cy, { count: 10, spread: 4, colors: ['#ffc83d', '#ff5fae', '#8a879a'] });
      if (!hit?.closest('main')) return;
      play('tap');
      scorch(shot.x, shot.y);
      damageNumber(shot.x, shot.y, `-${5 + Math.floor(Math.random() * 40)}`);
      hit
        .closest(CARD)
        ?.animate(
          [
            { translate: '0 0', filter: 'brightness(1.5) saturate(1.3)' },
            { translate: '5px 1px' },
            { translate: '-4px -1px' },
            { translate: '2px 0' },
            { translate: '0 0', filter: 'none' },
          ],
          { duration: 280, easing: 'ease-out' },
        );
    };

    const updateShots = (dt: number, now: number) => {
      for (let i = shots.length - 1; i >= 0; i--) {
        const shot = shots[i];
        shot.x += shot.vx * dt;
        shot.y += shot.vy * dt;
        shot.went += SHOT_SPEED * dt;
        const cx = shot.x - window.scrollX;
        const cy = shot.y - window.scrollY;
        const hitCursor = cursor.inside && now - cursor.at < CURSOR_MS && Math.hypot(cursor.x - cx, cursor.y - cy) < 16;
        const offscreen = cx < -20 || cy < -20 || cx > window.innerWidth + 20 || cy > window.innerHeight + 20;
        if (hitCursor) {
          fx.burst(cursor.x, cursor.y, { count: 16, spread: 5, colors: ['#ff4d5e', '#ffc83d', '#ffffff'] });
          damageNumber(cursor.x + window.scrollX, cursor.y + window.scrollY, '-1 HP');
          play('hit');
          if (Math.random() < 0.25) say(pickLine(LINES.hit));
        } else if (shot.went >= shot.range && !offscreen) {
          impact(shot);
        } else if (!offscreen) {
          shot.node.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${Math.atan2(shot.vy, shot.vx)}rad)`;
          continue;
        }
        shot.node.remove();
        shots.splice(i, 1);
      }
    };

    // ── Main loop ─────────────────────────────────────────────────────────
    let last = performance.now();
    let scannedAt = last;
    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // Cards move (reveals, accordions), so refresh the map; inside the loop, so it pauses with a hidden tab.
      if (now - scannedAt > 300) {
        scannedAt = now;
        rescan();
      }
      refresh(s.on);
      if (s.mode === 'jump') refresh(s.jump.to);
      const fl = floor();
      const viewTop = window.scrollY + HUD_TOP;
      const visible = plats.filter((p) => p.top > viewTop + size && p.top < fl.top - 8 && p.right - p.left > size * 2);
      const present = cursor.inside && now - cursor.at < CURSOR_MS;
      const fighting = present && now > s.truceUntil;
      let walking = false;

      updateShots(dt, now);

      if (s.mode === 'jump') {
        const j = s.jump;
        j.t += dt;
        if (j.t >= j.T) {
          const to = resolve(j.to);
          s.x = j.tx;
          if (to) land(to, now);
          else s.mode = 'fall';
        } else {
          s.x = j.x0 + j.vx * j.t;
          s.y = j.y0 + j.vy * j.t + 0.5 * GRAVITY * j.t * j.t;
        }
      } else if (s.mode === 'fall') {
        const prev = s.y;
        s.vy += GRAVITY * dt;
        s.y += s.vy * dt;
        // Small slack: cards slide while revealing, so a crossing between scans still counts.
        const hit = visible.find((p) => prev <= p.top + 24 && s.y >= p.top && s.x >= p.left && s.x <= p.right);
        if (hit) land(hit, now);
        else if (s.y >= fl.top) land(fl, now);
      } else {
        const p = resolve(s.on);
        if (!p || s.x < p.left - 4 || s.x > p.right + 4) {
          s.mode = 'fall'; // the card moved or vanished under us
        } else {
          s.y = p.top;
          const inView = s.y - size > viewTop - 8 && s.y <= fl.top + 1;
          if (!inView) {
            jumpTo(pickLanding(visible, fl, s.x, window.scrollY + window.innerHeight * 0.55, half), s.x);
          } else if (now - s.landed > 250) {
            if (fighting) {
              // Fight: get onto the cursor's card, keep a stand-off distance, then fire volleys.
              const cx = cursor.x + window.scrollX;
              const cy = cursor.y + window.scrollY;
              const under = platformUnder(visible, fl, cx, cy);
              const target = under.el === null && p.el !== null ? p : under;
              const side = cx > s.x ? 1 : -1;
              if (s.volley === 0) {
                walking =
                  target.el === p.el
                    ? walkTo(clampX(p, cx - side * STANDOFF, half), dt)
                    : travel(p, target, cx - side * STANDOFF, dt);
              }
              if (!walking && s.mode === 'ground') {
                s.dir = side;
                if (s.volley === 0 && now > s.nextVolley && Math.hypot(cx - s.x, cy - s.y) < 750) s.volley = 3;
                if (s.volley > 0 && now > s.nextShot) {
                  fire(now);
                  s.volley--;
                  s.nextShot = now + 150;
                  if (s.volley === 0) s.nextVolley = now + 1300 + Math.random() * 1200;
                }
              }
            } else if (p.el === null && visible.length && now > s.pauseUntil) {
              // On the screen floor with cards around: climb back up.
              jumpTo(pickLanding(visible, fl, s.x, window.scrollY + window.innerHeight * 0.55, half), s.x);
            } else if (now > s.pauseUntil) {
              // Patrol: edge to edge, look around at each end, hop to a nearby card every few turns.
              walking = walkTo(s.dir > 0 ? p.right - half : p.left + half, dt, WALK * 0.8);
              if (!walking) {
                s.turns++;
                s.pauseUntil = now + 700 + Math.random() * 900;
                s.dir = -s.dir as 1 | -1;
                if (!cursor.inside && Math.random() < 0.3) say(pickLine(LINES.relax));
                const near = visible.filter(
                  (q) => q.el !== p.el && Math.abs(q.top - p.top) < 420 && Math.abs((q.left + q.right) / 2 - s.x) < 600,
                );
                if (s.turns % 3 === 0 && near.length) {
                  const q = near[Math.floor(Math.random() * near.length)];
                  jumpTo(q, q.left + Math.random() * (q.right - q.left));
                }
              }
            }
          }
        }
      }

      // ── Draw ── (only write what changed: the body has a glow filter, so each change repaints it)
      const root = rootRef.current;
      const body = bodyRef.current;
      const eyes = eyesRef.current;
      if (!root || !body || !eyes) return;
      const step = walking ? -Math.abs(Math.sin(now / 70)) * 3 : 0;
      // Page coordinates in a page-anchored layer: the browser scrolls the bot with the content, no per-frame scroll compensation to lag behind.
      root.style.transform = `translate3d(${s.x - half}px, ${s.y - size + step}px, 0)`;
      const airborne = s.mode !== 'ground';
      const recoil = now - s.recoilAt < 90 ? -3 : 0;
      const squash = airborne ? '0.92, 1.1' : now - s.landed < 120 ? '1.15, 0.82' : '1, 1';
      const [sx, sy] = squash.split(', ');
      setIfChanged(body, 'transform', `translateX(${recoil * s.dir}px) scale(${s.dir * Number(sx)}, ${sy})`);
      if (jetRef.current) jetRef.current.style.opacity = airborne ? String(0.7 + Math.random() * 0.3) : '0';
      if (flashRef.current) setIfChanged(flashRef.current, 'opacity', now - s.recoilAt < 70 ? '1' : '0');

      // Eyes look up when the cursor is above, and blink now and then.
      if (now > s.blinkAt + 140) s.blinkAt = now + 2500 + Math.random() * 2500;
      const blink = now > s.blinkAt;
      const ly = present && cursor.y + window.scrollY < s.y - size ? -1 : 0;
      const look = `${4 + ly + (blink ? 1 : 0)}/${blink ? 1 : 2}`;
      if (eyes.dataset.look !== look) {
        eyes.dataset.look = look;
        for (const rect of eyes.children) {
          rect.setAttribute('y', String(4 + ly + (blink ? 1 : 0)));
          rect.setAttribute('height', blink ? '1' : '2');
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', rescan);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onLeave);
      for (const shot of shots) shot.node.remove();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Damage left on the page, in page coordinates (the body is the positioned ancestor). */}
      <div ref={decalsRef} className="pointer-events-none absolute left-0 top-0 z-20" />
      {/* Scorch art, cloned for each impact */}
      <div ref={crackRef} hidden>
        <PixelArt sprite={CRACK} className="size-full" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-35 overflow-hidden">
        <div ref={shotsRef} />
      </div>
      <div className="pointer-events-none absolute left-0 top-0 z-35">
        <div ref={rootRef} className="absolute top-0 left-0 will-change-transform">
          <AnimatePresence>
            {line && (
              <motion.span
                key={line.id}
                role="status"
                initial={{ opacity: 0, y: 4, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-foreground/80 bg-card px-2 py-1 font-pixel text-[9px] uppercase tracking-wider">
                {line.text}
              </motion.span>
            )}
          </AnimatePresence>
          {/* Ground shadow */}
          <span className="absolute -bottom-1 left-1/2 h-1.5 w-3/4 -translate-x-1/2 rounded-full bg-black/40 blur-[2px]" />
          <button
            type="button"
            tabIndex={-1}
            data-sfx="none"
            aria-label="Poke the site bot"
            onClick={() => poke.current()}
            className="pointer-events-auto block cursor-pointer">
            <div
              ref={bodyRef}
              className="relative size-12 sm:size-16 origin-bottom drop-shadow-[0_0_6px_color-mix(in_oklab,var(--game-amber)_60%,transparent)]">
              {/* Jet flames, lit while airborne */}
              <span
                ref={jetRef}
                className="absolute top-full left-[22%] h-3 w-[56%] bg-linear-to-b from-game-amber via-game-pink to-transparent opacity-0 [clip-path:polygon(0_0,100%_0,75%_100%,50%_40%,25%_100%)]"
              />
              <PixelArt sprite={MECH} className="absolute inset-0 size-full" />
              <svg
                viewBox="0 0 16 16"
                shapeRendering="crispEdges"
                aria-hidden="true"
                className="absolute inset-0 size-full">
                <g ref={eyesRef} transform="translate(1 0)">
                  <rect x={4} y={4} width={1} height={2} fill="var(--game-cyan)" />
                  <rect x={7} y={4} width={1} height={2} fill="var(--game-cyan)" />
                </g>
              </svg>
              {/* Muzzle flash at the blaster */}
              <span
                ref={flashRef}
                className="absolute top-[44%] -right-2 size-3 rounded-full bg-white opacity-0 shadow-[0_0_10px_4px_var(--game-pink)]"
              />
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
