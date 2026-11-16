'use client';

import { AnimatePresence, motion, useAnimate, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { PixelArt } from '@/components/pixel-art';
import { play } from '@/features/sound/sound.lib';
import type { Sprite } from '@/lib/pixel-art';
import { cn } from '@/lib/utils';

// Screen (rows 5–9, cols 4–11) is left dark; the eyes are drawn on top so they can move.
const BOT: Sprite = [
  '.......yy.......',
  '.......kk.......',
  '.......kk.......',
  '...kkkkkkkkkk...',
  '..kWWWWWWWWWWk..',
  '..kWkkkkkkkkWk..',
  '..kWkkkkkkkkWk..',
  '.kkWkkkkkkkkWkk.',
  '.kgWkkkkkkkkWgk.',
  '.kkWkkkkkkkkWkk.',
  '..kWWWWWWWWWWk..',
  '...kkkkkkkkkk...',
  '....kgWWWWgk....',
  '...kgWWccWWgk...',
  '...kkkkkkkkkk...',
  '....kk....kk....',
];

const BOT_LINES = ['Beep! Hi.', 'Boop.', "I'm the party bot.", 'Click Next for more.', 'Hey, that tickles!'];

/** 16px sprite at 4×, or 3× in narrow boxes; whole multiples keep the pixels crisp. */
const sizeFor = (width: number) => (width < 480 ? 48 : 64);
const MARGIN = 12; // spare height the bot needs above its feet before it moves in

type Look = { x: -1 | 0 | 1; y: -1 | 0 | 1 };

/** Fills the dialogue box's spare space with a little bot that follows the cursor. Hides when there's no room. */
export function PartyBot() {
  const reduce = useReducedMotion();
  const areaRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(false);
  const [size, setSize] = useState(64);
  const [look, setLook] = useState<Look>({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [line, setLine] = useState<number | null>(null);
  const said = useRef(0);
  const target = useMotionValue(0);
  const x = useSpring(target, { stiffness: 60, damping: 14 });
  const [scope, animate] = useAnimate<HTMLDivElement>();

  // Show only when the leftover space is tall enough; start centred.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const s = sizeFor(width);
      setSize(s);
      setRoom(height >= s + MARGIN);
      if (target.get() === 0 || target.get() > width - s) target.jump((width - s) / 2);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [target]);

  // Walk toward the cursor and look at it.
  useEffect(() => {
    if (!room) return;
    const onMove = (e: PointerEvent) => {
      const el = areaRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!reduce) target.set(Math.min(Math.max(e.clientX - r.left - size / 2, 0), r.width - size));
      const cx = r.left + x.get() + size / 2;
      const cy = r.bottom - size / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      setLook({
        x: Math.abs(dx) < 24 ? 0 : dx < 0 ? -1 : 1,
        y: Math.abs(dy) < 24 ? 0 : dy < 0 ? -1 : 1,
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [room, reduce, target, x, size]);

  // Blink every few seconds.
  useEffect(() => {
    if (!room || reduce) return;
    let t: number;
    const loop = () => {
      t = window.setTimeout(
        () => {
          setBlink(true);
          window.setTimeout(() => setBlink(false), 140);
          loop();
        },
        2600 + Math.random() * 2400,
      );
    };
    loop();
    return () => window.clearTimeout(t);
  }, [room, reduce]);

  // Clear the speech bubble after a moment.
  useEffect(() => {
    if (line === null) return;
    const t = window.setTimeout(() => setLine(null), 1800);
    return () => window.clearTimeout(t);
  }, [line]);

  const poke = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't turn the dialogue page
    play('toggle');
    setLine(said.current++ % BOT_LINES.length);
    if (!reduce) void animate(scope.current, { y: [0, -16, 0], scaleY: [1, 1.1, 0.9, 1] }, { duration: 0.45 });
  };

  const eyeH = blink ? 1 : 2;
  const eyeY = 6 + look.y + (blink ? 1 : 0);
  const bubbleLeft = x.get() > (areaRef.current?.clientWidth ?? 0) / 2;

  return (
    <div ref={areaRef} className="relative min-h-0 flex-1" aria-hidden={!room}>
      <AnimatePresence>
        {room && (
          <motion.div
            className="absolute bottom-0 left-0"
            style={{ x }}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }}>
            <AnimatePresence>
              {line !== null && (
                <motion.span
                  key={line}
                  role="status"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={cn(
                    'absolute bottom-12 whitespace-nowrap rounded-lg border-2 border-foreground/80 bg-card px-2 py-1 font-pixel text-[9px] uppercase tracking-wider',
                    bubbleLeft ? 'right-full mr-1 origin-bottom-right' : 'left-full ml-1 origin-bottom-left',
                  )}>
                  {BOT_LINES[line]}
                </motion.span>
              )}
            </AnimatePresence>

            <button
              type="button"
              data-sfx="none"
              onClick={poke}
              aria-label="Poke the party bot"
              className="block cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2">
              <motion.div
                ref={scope}
                style={{ width: size, height: size, originY: 1 }}
                animate={reduce ? undefined : { y: [0, -2, 0] }}
                transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                className="relative">
                <PixelArt sprite={BOT} className="absolute inset-0 size-full" />
                {/* Eyes, in sprite pixels on the same 16×16 grid */}
                <svg
                  viewBox="0 0 16 16"
                  shapeRendering="crispEdges"
                  aria-hidden="true"
                  className="absolute inset-0 size-full">
                  <rect x={5 + look.x} y={eyeY} width={2} height={eyeH} fill="var(--game-accent)" />
                  <rect x={9 + look.x} y={eyeY} width={2} height={eyeH} fill="var(--game-accent)" />
                </svg>
              </motion.div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
