'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { fx } from '@/features/fx/fx.lib';
import { useGameActions, useGameState } from '@/features/game/game-provider';
import { resumeData } from '@/lib/resume';

const TITLE = resumeData.name.toUpperCase();
const LOAD_MS = 1300;
const SEGMENTS = 20;

export function StartScreen() {
  const { muted } = useGameState();
  const { start, toggleMute } = useGameActions();
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  // Marks hydration: until then a CSS failsafe hides this screen after 8s in case JS never loads.
  const [hydrated, setHydrated] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const done = useRef(false);
  const ready = progress >= 100;

  useEffect(() => {
    setHydrated(true);
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

  const go = (silent = false) => {
    if (done.current) return;
    done.current = true;
    if (silent && !muted) toggleMute();
    start();
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    fx.ripple(x, y, 1.6);
    fx.burst(x, y, { count: 60, spread: 10 });
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    go();
  });

  useEffect(() => {
    if (!ready) return;
    buttonRef.current?.focus({ preventScroll: true });
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ready]);

  return (
    <motion.div
      id="start-screen"
      data-hydrated={hydrated ? '' : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Start screen"
      className="fixed inset-0 z-80 grid place-items-center overflow-hidden bg-background/80 backdrop-blur-md crt"
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.6 }}
      transition={{ duration: 0.6, ease: [0.7, 0, 0.84, 0] }}>
      <div className="relative flex flex-col items-center gap-8 px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-pixel text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground">
          rzknkbr.xyz presents
        </motion.p>

        <p
          aria-hidden
          className="font-pixel text-4xl sm:text-6xl md:text-7xl leading-none flex flex-wrap justify-center">
          {TITLE.split('').map((ch, i) => (
            <motion.span
              // biome-ignore lint/suspicious/noArrayIndexKey: letters of a static string
              key={i}
              className="inline-block start-title-glow"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -80, rotate: -20 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.15 + i * 0.045 }}>
              {ch === ' ' ? ' ' : ch}
            </motion.span>
          ))}
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-pixel text-[10px] sm:text-xs uppercase tracking-widest text-game-accent-text">
          Senior Product Engineer · Full-stack · Web3
        </motion.p>

        <div className="h-24 flex flex-col items-center justify-center gap-4">
          {ready ? (
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
          ) : (
            <div className="flex flex-col items-center gap-2" role="status" aria-live="polite">
              <div className="flex gap-1">
                {Array.from({ length: SEGMENTS }, (_, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed segments
                    key={i}
                    className={
                      progress >= ((i + 1) * 100) / SEGMENTS ? 'h-4 w-2.5 bg-game-accent' : 'h-4 w-2.5 bg-muted'
                    }
                  />
                ))}
              </div>
              <span className="font-pixel text-[10px] text-muted-foreground tabular-nums">
                LOADING WORLD… {progress}%
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
