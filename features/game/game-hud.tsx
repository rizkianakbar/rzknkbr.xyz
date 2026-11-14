'use client';

import { Trophy, Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ACHIEVEMENTS, MAX_LEVEL, STORAGE_KEYS } from '@/features/game/game.constants';
import { levelFor, levelProgress, readStorage, writeStorage } from '@/features/game/game.lib';
import { useGameActions, useGameState } from '@/features/game/game-provider';
import { QuestBoard } from '@/features/game/game-quest-board';
import { play } from '@/features/sound/sound.lib';

/** Wait for the "Player 2 has joined" toast to clear before showing the how-to-play hint. */
const COACH_DELAY_MS = 5200;

const HUD_BUTTON =
  'pointer-events-auto rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-lg shadow-black/5 hover:border-game-accent transition-colors';

export function Hud() {
  const { xp, unlocked, muted, started } = useGameState();
  const { toggleMute } = useGameActions();
  const [boardOpen, setBoardOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [boardSeen, setBoardSeen] = useState(true);
  const info = levelFor(xp);

  // Storage flags are read after hydration; the coach mark waits for its own timer.
  useEffect(() => {
    setBoardSeen(readStorage('local', STORAGE_KEYS.boardSeen) === '1');
    if (!started || readStorage('local', STORAGE_KEYS.coachSeen) === '1') return;
    const timer = window.setTimeout(() => setCoachOpen(true), COACH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [started]);

  const dismissCoach = () => {
    setCoachOpen(false);
    writeStorage('local', STORAGE_KEYS.coachSeen, '1');
  };

  const openBoard = () => {
    setBoardOpen(true);
    setBoardSeen(true);
    writeStorage('local', STORAGE_KEYS.boardSeen, '1');
    dismissCoach();
  };

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: started ? 0 : -80 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: started ? 0.5 : 0 }}
        className="fixed top-3 inset-x-0 z-40 px-3 pointer-events-none">
        <div className="relative mx-auto max-w-5xl flex items-center justify-between gap-3">
          <button
            type="button"
            data-sfx="open"
            onClick={openBoard}
            aria-label={`Level ${info.level} of ${MAX_LEVEL}, ${xp} XP. Open quest board`}
            className={`${HUD_BUTTON} pl-1.5 pr-4 py-1.5 text-left`}>
            {/* Keyed on xp so the pulse replays on every gain without remounting the button (keeps focus). */}
            <motion.span
              key={xp}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-3">
              <span className="grid place-items-center size-9 rounded-xl bg-game-accent text-game-accent-foreground font-pixel text-[11px] leading-none">
                <span>LV</span>
                <span className="text-sm">{info.level}</span>
              </span>
              <span className="flex flex-col gap-1 min-w-0">
                <span className="flex items-baseline justify-between gap-4 font-pixel text-[10px] uppercase tracking-wide whitespace-nowrap">
                  <span>
                    {info.title}
                    <span className="hidden sm:inline text-muted-foreground">
                      {' '}
                      · {info.level}/{MAX_LEVEL}
                    </span>
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {xp}
                    {info.next !== null && `/${info.next}`} XP
                  </span>
                </span>
                <span className="block h-2 w-36 sm:w-48 rounded-full bg-muted overflow-hidden">
                  <motion.span
                    className="block h-full rounded-full bg-game-accent xp-shine"
                    initial={false}
                    animate={{ width: `${Math.max(4, levelProgress(xp) * 100)}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  />
                </span>
              </span>
            </motion.span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-sfx="open"
              onClick={openBoard}
              className={`${HUD_BUTTON} relative flex items-center gap-2 h-12 px-3 font-pixel text-[11px]`}
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
              className={`${HUD_BUTTON} grid place-items-center size-12`}
              aria-label={muted ? 'Turn sound on' : 'Mute sound'}
              aria-pressed={!muted}>
              {muted ? <VolumeX className="size-4 text-muted-foreground" /> : <Volume2 className="size-4" />}
            </button>
          </div>

          <AnimatePresence>
            {coachOpen && <CoachMark onOpenBoard={openBoard} onDismiss={dismissCoach} />}
          </AnimatePresence>
        </div>
      </motion.header>

      <AnimatePresence>{boardOpen && <QuestBoard onClose={() => setBoardOpen(false)} />}</AnimatePresence>
    </>
  );
}

type CoachMarkProps = {
  onOpenBoard: () => void;
  onDismiss: () => void;
};

/** One-time "how to play" hint pointing at the XP bar. */
function CoachMark(props: CoachMarkProps) {
  const { onOpenBoard, onDismiss } = props;
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
          onClick={onOpenBoard}
          className="rounded-xl bg-game-accent text-game-accent-foreground text-xs font-semibold px-3 py-2 pointer-coarse:py-3 hover:brightness-110 transition">
          Show me the clues
        </button>
        <button
          type="button"
          data-sfx="close"
          onClick={onDismiss}
          className="rounded-xl border border-border text-xs font-semibold px-3 py-2 pointer-coarse:py-3 hover:bg-muted transition-colors">
          I&apos;ll figure it out
        </button>
      </div>
    </motion.div>
  );
}
