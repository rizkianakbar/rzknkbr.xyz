'use client';

import { motion, useReducedMotion } from 'motion/react';
import { type JSX, useEffect, useRef, useState } from 'react';
import { useGame } from '@/components/game/game-provider';
import { fx } from '@/lib/fx';

const TITLE = 'RIZKIAN AKBAR';
const LOAD_MS = 1300;

export function StartScreen(): JSX.Element {
  const { start, toggleMute, muted } = useGame();
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const ready = progress >= 100;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const done = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    const begin = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - begin) / (reduce ? 1 : LOAD_MS));
      setProgress(Math.round((1 - (1 - t) ** 3) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = '';
    };
  }, [reduce]);

  useEffect(() => {
    if (ready) buttonRef.current?.focus({ preventScroll: true });
  }, [ready]);

  const go = (silent = false) => {
    if (done.current) return;
    done.current = true;
    if (silent && !muted) toggleMute();
    start();
    const r = buttonRef.current?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
    const y = r ? r.top + r.height / 2 : window.innerHeight / 2;
    fx.ripple(x, y, 1.6);
    fx.burst(x, y, { count: 60, spread: 10 });
  };

  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <motion.div
      id="start-screen"
      data-hydrated={hydrated ? '' : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Start screen"
      className="fixed inset-0 z-80 grid place-items-center overflow-hidden bg-background/80 backdrop-blur-md crt"
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.6, filter: 'blur(12px)' }}
      transition={{ duration: 0.6, ease: [0.7, 0, 0.84, 0] }}>
      <div className="relative flex flex-col items-center gap-8 px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-pixel text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground">
          rzknkbr.xyz presents
        </motion.p>

        <h1 className="font-pixel text-4xl sm:text-6xl md:text-7xl leading-none text-foreground flex flex-wrap justify-center">
          {TITLE.split('').map((ch, i) => (
            <motion.span
              // biome-ignore lint/suspicious/noArrayIndexKey: static string
              key={i}
              className="inline-block start-title-glow"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -80, rotate: -20 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.15 + i * 0.045 }}>
              {ch === ' ' ? ' ' : ch}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-pixel text-[10px] sm:text-xs uppercase tracking-widest text-game-accent-text">
          Senior Product Engineer · Full-stack · Web3
        </motion.p>

        <div className="h-24 flex flex-col items-center justify-center gap-4">
          {!ready ? (
            <div className="flex flex-col items-center gap-2" role="status" aria-live="polite">
              <div className="flex gap-1">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed segments
                    key={i}
                    className={progress >= (i + 1) * 5 ? 'h-4 w-2.5 bg-game-accent' : 'h-4 w-2.5 bg-muted'}
                  />
                ))}
              </div>
              <span className="font-pixel text-[10px] text-muted-foreground tabular-nums">
                LOADING WORLD… {progress}%
              </span>
            </div>
          ) : (
            <>
              <motion.button
                ref={buttonRef}
                type="button"
                onClick={() => go()}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="press-start font-pixel text-sm sm:text-base uppercase tracking-widest rounded-2xl border-2 border-game-accent bg-game-accent text-game-accent-foreground px-8 py-4 shadow-[0_0_0_6px_var(--game-accent-soft),0_10px_40px_-5px_var(--game-accent)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/40">
                ▶ Press start
              </motion.button>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-muted-foreground">
                🔊 Best with sound · Enter works too ·{' '}
                <button
                  type="button"
                  onClick={() => go(true)}
                  className="underline underline-offset-4 hover:text-foreground">
                  start muted
                </button>
              </motion.p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
