'use client';

import { Lock, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type JSX, useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '@/components/game/game-provider';
import { ACHIEVEMENTS, LEVELS, levelFor, MAX_LEVEL } from '@/lib/achievements';
import { play } from '@/lib/sound';
import { cn } from '@/lib/utils';

const COACH_KEY = 'rzk-coach-seen';
const BOARD_KEY = 'rzk-board-seen';
/** Wait for the "Player 2 has joined" toast to clear before showing the how-to-play hint. */
const COACH_DELAY_MS = 5200;

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function setFlag(key: string): void {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // Storage blocked: the hint may show again next visit, which is fine.
  }
}

export function Hud(): JSX.Element {
  const { xp, unlocked, muted, toggleMute, started } = useGame();
  const [open, setOpen] = useState(false);
  const [coach, setCoach] = useState(false);
  const [boardSeen, setBoardSeen] = useState(true);
  const info = levelFor(xp);
  const progress = info.next === null ? 1 : (xp - info.current) / (info.next - info.current);
  const [pulse, setPulse] = useState(0);
  const prevXp = useRef(xp);

  useEffect(() => {
    if (xp > prevXp.current) setPulse((p) => p + 1);
    prevXp.current = xp;
  }, [xp]);

  useEffect(() => {
    setBoardSeen(readFlag(BOARD_KEY));
    if (!started || readFlag(COACH_KEY)) return;
    const t = window.setTimeout(() => setCoach(true), COACH_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [started]);

  const dismissCoach = useCallback(() => {
    setCoach(false);
    setFlag(COACH_KEY);
  }, []);

  const openBoard = useCallback(() => {
    setOpen(true);
    setBoardSeen(true);
    setFlag(BOARD_KEY);
    dismissCoach();
  }, [dismissCoach]);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: started ? 0 : -80 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: started ? 0.5 : 0 }}
        className="fixed top-3 inset-x-0 z-40 px-3 pointer-events-none">
        <div className="relative mx-auto max-w-5xl flex items-center justify-between gap-3">
          <motion.button
            type="button"
            data-sfx="open"
            onClick={openBoard}
            key={pulse}
            animate={pulse ? { scale: [1, 1.06, 1] } : undefined}
            transition={{ duration: 0.35 }}
            aria-label={`Level ${info.level} of ${MAX_LEVEL}, ${xp} XP. Open quest board`}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-card/80 backdrop-blur-xl pl-1.5 pr-4 py-1.5 shadow-lg shadow-black/5 text-left hover:border-game-accent transition-colors">
            <div className="grid place-items-center size-9 rounded-xl bg-game-accent text-game-accent-foreground font-pixel text-[11px] leading-none">
              <span>LV</span>
              <span className="text-sm">{info.level}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-baseline justify-between gap-4 font-pixel text-[10px] uppercase tracking-wide whitespace-nowrap">
                <span className="text-foreground">
                  {info.title}
                  <span className="hidden sm:inline text-muted-foreground">
                    {' '}
                    · {info.level}/{MAX_LEVEL}
                  </span>
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {xp}
                  {info.next !== null ? `/${info.next}` : ''} XP
                </span>
              </div>
              <div className="h-2 w-36 sm:w-48 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-game-accent xp-shine"
                  initial={false}
                  animate={{ width: `${Math.max(4, progress * 100)}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                />
              </div>
            </div>
          </motion.button>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              data-sfx="open"
              onClick={openBoard}
              className="relative flex items-center gap-2 h-12 rounded-2xl border border-border bg-card/80 backdrop-blur-xl px-3 font-pixel text-[11px] shadow-lg shadow-black/5 hover:border-game-accent transition-colors"
              aria-label={`Quest board: ${unlocked.length} of ${ACHIEVEMENTS.length} achievements unlocked`}>
              <Trophy className="size-4 text-game-amber" aria-hidden />
              <span className="tabular-nums">
                {unlocked.length}/{ACHIEVEMENTS.length}
              </span>
              {!boardSeen && (
                <span className="absolute -top-1 -right-1 flex size-3" aria-hidden>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-game-amber opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-game-amber" />
                </span>
              )}
            </button>
            <button
              type="button"
              data-sfx="none"
              onClick={toggleMute}
              className="grid place-items-center size-12 rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-lg shadow-black/5 hover:border-game-accent transition-colors"
              aria-label={muted ? 'Turn sound on' : 'Mute sound'}
              aria-pressed={!muted}>
              {muted ? <VolumeX className="size-4 text-muted-foreground" /> : <Volume2 className="size-4" />}
            </button>
          </div>

          <AnimatePresence>{coach && <CoachMark onOpen={openBoard} onDismiss={dismissCoach} />}</AnimatePresence>
        </div>
      </motion.header>

      <AnimatePresence>{open && <QuestBoard onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function CoachMark({ onOpen, onDismiss }: { onOpen: () => void; onDismiss: () => void }): JSX.Element {
  const reduce = useReducedMotion();

  useEffect(() => {
    play('open');
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-label="How to play"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="pointer-events-auto absolute left-0 top-full mt-3 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border-2 border-game-accent bg-card/95 backdrop-blur-xl p-4 shadow-2xl">
      <span
        aria-hidden
        className="absolute -top-[9px] left-8 size-4 rotate-45 border-l-2 border-t-2 border-game-accent bg-card"
      />
      <p className="font-pixel text-[10px] uppercase tracking-widest text-game-accent-text">How to play</p>
      <p className="mt-2 text-sm leading-relaxed">
        This bar is <span className="font-semibold">you</span>. Explore, click and poke around to earn XP.
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {MAX_LEVEL} levels to climb and {ACHIEVEMENTS.length} achievements hidden in plain sight. The{' '}
        <Trophy className="inline size-3.5 -mt-0.5 text-game-amber" aria-label="trophy" /> board has clues.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          data-sfx="none"
          onClick={onOpen}
          className="rounded-xl bg-game-accent text-game-accent-foreground text-xs font-semibold px-3 py-2 hover:brightness-110 transition">
          Show me the clues
        </button>
        <button
          type="button"
          data-sfx="close"
          onClick={onDismiss}
          className="rounded-xl border border-border text-xs font-semibold px-3 py-2 hover:bg-muted transition-colors">
          I&apos;ll figure it out
        </button>
      </div>
    </motion.div>
  );
}

function RankLadder({ xp }: { xp: number }): JSX.Element {
  const info = levelFor(xp);
  const next = info.next === null ? null : LEVELS[info.level];

  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <ol className="flex items-center" aria-label={`Rank ${info.level} of ${MAX_LEVEL}`}>
        {LEVELS.map((lvl, i) => {
          const n = i + 1;
          const reached = n <= info.level;
          const isNext = n === info.level + 1;
          return (
            <li key={lvl.title} className="flex items-center flex-1 last:flex-none">
              <span
                title={reached || isNext ? lvl.title : 'Unknown rank'}
                className={cn(
                  'grid place-items-center size-8 shrink-0 rounded-lg font-pixel text-[10px] border-2',
                  reached && 'bg-game-accent border-game-accent text-game-accent-foreground',
                  isNext && 'border-game-accent/70 border-dashed text-game-accent-text',
                  !reached && !isNext && 'border-border text-muted-foreground',
                  n === info.level && 'ring-4 ring-game-accent/25',
                )}>
                {reached || isNext ? n : <Lock className="size-3" aria-hidden />}
              </span>
              {i < LEVELS.length - 1 && (
                <span className={cn('h-0.5 flex-1 mx-1', n < info.level ? 'bg-game-accent' : 'bg-border')} />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm">
        {next ? (
          <>
            Next rank: <span className="font-semibold text-game-accent-text">{next.title}</span>{' '}
            <span className="text-muted-foreground">· {next.xp - xp} XP to go</span>
          </>
        ) : (
          <span className="font-semibold text-game-amber">Max rank reached. You are a legend. 👑</span>
        )}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Big XP comes from achievements. A little comes from simply looking around. The final rank asks for everything,
        including what&apos;s hidden.
      </p>
    </div>
  );
}

function QuestBoard({ onClose }: { onClose: () => void }): JSX.Element {
  const { unlocked, xp, reset } = useGame();
  const reduce = useReducedMotion();
  const info = levelFor(xp);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        play('close');
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-60 grid place-items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}>
      <button
        type="button"
        data-sfx="close"
        aria-label="Close quest board"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm cursor-default"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-title"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-3xl border-2 border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="font-pixel text-[10px] uppercase text-game-accent-text tracking-widest">
              LV {info.level}/{MAX_LEVEL} · {info.title} · {xp} XP
            </p>
            <h2 id="board-title" className="text-2xl font-bold tracking-tight">
              Quest board
            </h2>
            <p className="text-sm text-muted-foreground">This whole site is a game. Clues below, answers out there.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            data-sfx="close"
            onClick={onClose}
            className="grid place-items-center size-9 shrink-0 rounded-xl border border-border hover:bg-muted transition-colors"
            aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <RankLadder xp={xp} />

        <div className="mt-5 mb-2 flex items-baseline justify-between">
          <h3 className="font-pixel text-[11px] uppercase tracking-widest">Achievements</h3>
          <span className="font-pixel text-[10px] text-muted-foreground tabular-nums">
            {unlocked.length}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <ul className="grid gap-2">
          {ACHIEVEMENTS.map((a, i) => {
            const got = unlocked.includes(a.id);
            const secret = !got && 'secret' in a && a.secret;
            return (
              <motion.li
                key={a.id}
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border p-3',
                  got ? 'border-game-accent/50 bg-game-accent/10' : 'border-border border-dashed',
                )}>
                <span
                  className={cn(
                    'grid place-items-center size-10 rounded-xl text-xl bg-muted shrink-0',
                    !got && 'grayscale opacity-50',
                  )}
                  aria-hidden>
                  {secret ? '❓' : a.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('font-semibold text-sm', !got && 'text-muted-foreground')}>
                    {secret ? 'Secret achievement' : a.title}
                  </p>
                  <p className={cn('text-xs', got ? 'text-muted-foreground' : 'italic text-muted-foreground/80')}>
                    {got ? a.description : `Clue: ${a.hint}`}
                  </p>
                </div>
                <span
                  className={cn(
                    'font-pixel text-[10px] shrink-0',
                    got ? 'text-game-accent-text' : 'text-muted-foreground',
                  )}>
                  {got ? '✓ ' : '+'}
                  {a.xp}XP
                </span>
              </motion.li>
            );
          })}
        </ul>

        <button
          type="button"
          data-sfx="none"
          onClick={reset}
          className="mt-5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Reset progress
        </button>
      </motion.div>
    </motion.div>
  );
}
