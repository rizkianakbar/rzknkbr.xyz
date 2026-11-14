'use client';

import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { PixelArt } from '@/components/pixel-art';
import { BOSS_HP, BOSS_SPRITE } from '@/features/contact/contact.constants';
import { applyMove, type BattleMove, INITIAL_BATTLE } from '@/features/contact/contact.lib';
import { fx } from '@/features/fx/fx.lib';
import { useGameActions } from '@/features/game/game-provider';
import { play } from '@/features/sound/sound.lib';
import { resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

type Move = BattleMove & {
  label: string;
  /** Copies the email; everything else is a link. */
  copy?: boolean;
  href?: string;
  cv?: boolean;
  crit?: boolean;
};

const { contact } = resumeData;

const MOVES: Move[] = [
  {
    id: 'email',
    label: 'Copy email',
    damage: 40,
    crit: true,
    copy: true,
    line: 'Critical hit! My email is in your clipboard.',
  },
  {
    id: 'resume',
    label: 'Read resume',
    damage: 30,
    href: resumeData.cvUrl,
    cv: true,
    line: 'You studied the scroll. It’s super effective!',
  },
  {
    id: 'mail',
    label: 'Mail app',
    damage: 30,
    href: `mailto:${contact.email}`,
    line: 'An email takes flight. Direct hit!',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    damage: 25,
    href: contact.social.LinkedIn.url,
    line: 'A connection request lands a solid hit!',
  },
  {
    id: 'github',
    label: 'GitHub',
    damage: 20,
    href: contact.social.GitHub.url,
    line: 'You inspected the source. The boss staggers!',
  },
  { id: 'x', label: 'Send a DM', damage: 15, href: contact.social.X.url, line: 'A DM zips across the arena!' },
];

type Hit = { id: number; amount: number; crit: boolean };

/** How long the defeat animation plays before the victory screen takes over. */
const VICTORY_DELAY_MS = 900;

/** The contact section as a boss fight: every way to reach me is an attack. */
export function ContactBattle() {
  const { award, notify } = useGameActions();
  const reduce = useReducedMotion();
  const [battle, setBattle] = useState(INITIAL_BATTLE);
  // Mirrors `battle` so two fast clicks before a re-render both apply to the latest HP.
  const battleRef = useRef(INITIAL_BATTLE);
  const [hits, setHits] = useState<Hit[]>([]);
  const [won, setWon] = useState(false);
  const [boss, animateBoss] = useAnimate<HTMLDivElement>();
  const timers = useRef<number[]>([]);
  const nextHit = useRef(0);

  useEffect(
    () => () => {
      for (const t of timers.current) window.clearTimeout(t);
    },
    [],
  );

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const strike = (move: Move) => {
    const { state, dealt } = applyMove(battleRef.current, move);
    battleRef.current = state;
    setBattle(state);
    if (!dealt) {
      play('close');
      return;
    }

    play('hit');
    if (move.crit) play('coin');
    const id = ++nextHit.current;
    setHits((list) => [...list, { id, amount: dealt, crit: !!move.crit }]);
    later(() => setHits((list) => list.filter((h) => h.id !== id)), 900);

    const rect = boss.current?.getBoundingClientRect();
    if (rect)
      fx.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, { count: move.crit ? 40 : 22, spread: 8 });
    if (!reduce && boss.current) {
      void animateBoss(boss.current, { x: [0, -14, 12, -8, 5, 0] }, { duration: 0.35 });
      void animateBoss(
        boss.current,
        { filter: ['brightness(1)', 'brightness(3)', 'brightness(1)'] },
        { duration: 0.25 },
      );
    }

    if (state.hp === 0) {
      play('levelUp');
      later(
        () => {
          fx.confetti(220);
          setWon(true);
        },
        reduce ? 0 : VICTORY_DELAY_MS,
      );
    }
  };

  const copyEmail = async (move: Move, at: { x: number; y: number }) => {
    strike(move);
    try {
      await navigator.clipboard.writeText(contact.email);
      notify({ title: 'Email copied!', description: contact.email, emoji: '📋' });
      award('party-invite', at);
    } catch {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  const rematch = () => {
    play('start');
    battleRef.current = INITIAL_BATTLE;
    setBattle(INITIAL_BATTLE);
    setWon(false);
  };

  const hpPercent = (battle.hp / BOSS_HP) * 100;
  const defeated = battle.hp === 0;

  return (
    <div className="relative overflow-hidden rounded-4xl border-2 border-game-pink/40 bg-card shadow-[0_0_60px_-24px_var(--game-pink)]">
      {/* Arena */}
      <div className="crt relative h-72 overflow-hidden bg-[radial-gradient(ellipse_at_50%_100%,color-mix(in_oklab,var(--game-violet)_30%,transparent),transparent_65%)] sm:h-80">
        {/* Floor grid */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(transparent_95%,color-mix(in_oklab,var(--game-pink)_35%,transparent)_95%),linear-gradient(90deg,transparent_95%,color-mix(in_oklab,var(--game-pink)_35%,transparent)_95%)] bg-size-[28px_28px] opacity-40 mask-[linear-gradient(to_bottom,transparent,black)]"
        />

        <AnimatePresence mode="wait">
          {won ? (
            <Victory key="victory" onRematch={rematch} />
          ) : (
            <motion.div key="fight" className="absolute inset-0" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
              {/* Nameplate + HP */}
              <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-80 rounded-xl border-2 border-border bg-background/80 p-3 backdrop-blur">
                <div className="flex items-baseline justify-between font-pixel text-[10px] uppercase tracking-widest">
                  <span className="text-game-pink">Final boss</span>
                  <span className="text-muted-foreground">LV 99</span>
                </div>
                <p className="mt-1 font-bold">The Opportunity</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-pixel text-[9px] text-game-amber">HP</span>
                  <div className="relative h-3 flex-1 overflow-hidden rounded-sm border border-border bg-muted">
                    <motion.div
                      className={cn(
                        'h-full',
                        hpPercent > 50 ? 'bg-game-accent' : hpPercent > 20 ? 'bg-game-amber' : 'bg-game-red',
                      )}
                      initial={false}
                      animate={{ width: `${hpPercent}%` }}
                      transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                    />
                    {/* Segment ticks, like a game health bar */}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(90deg,transparent_calc(100%-2px),rgb(0_0_0/0.45)_calc(100%-2px))] bg-size-[10%_100%]"
                    />
                  </div>
                  <span className="w-14 text-right font-pixel text-[9px] tabular-nums">
                    {battle.hp}/{BOSS_HP}
                  </span>
                </div>
              </div>

              {/* Boss */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-[14%] sm:translate-x-0">
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-4 w-32 -translate-x-1/2 rounded-full bg-black/50 blur-sm"
                />
                <div className={cn('relative', !defeated && 'bob')}>
                  <motion.div
                    ref={boss}
                    animate={defeated && !reduce ? { scale: 0, rotate: 30, opacity: 0, y: -30 } : undefined}
                    transition={{ delay: 0.35, duration: 0.5, ease: [0.7, 0, 0.84, 0] }}>
                    <PixelArt sprite={BOSS_SPRITE} className="size-36 sm:size-44" />
                  </motion.div>
                </div>

                {/* Damage numbers */}
                <AnimatePresence>
                  {hits.map((hit) => (
                    <motion.span
                      key={hit.id}
                      aria-hidden
                      initial={{ opacity: 0, y: 0, scale: 0.6 }}
                      animate={{ opacity: [0, 1, 1, 0], y: -70, scale: hit.crit ? 1.3 : 1 }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className={cn(
                        'absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel drop-shadow-[0_2px_0_rgb(0_0_0/0.6)]',
                        hit.crit ? 'text-xl text-game-amber' : 'text-lg text-white',
                      )}>
                      {hit.crit ? `CRIT! -${hit.amount}` : `-${hit.amount}`}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              <p className="absolute bottom-4 left-4 hidden font-pixel text-[9px] uppercase tracking-widest text-muted-foreground sm:block">
                P2 · You
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialogue */}
      <div className="border-y-2 border-border bg-background/70 px-5 py-4" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={battle.line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="min-h-[3em] text-sm leading-relaxed sm:text-base">
            {battle.line}
            <span aria-hidden className="ml-2 inline-block animate-pulse text-game-pink">
              ▼
            </span>
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Command menu */}
      <ul className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
        {MOVES.map((move) => {
          const used = battle.used.includes(move.id);
          const body = (
            <>
              <span
                aria-hidden
                className="hidden text-game-pink opacity-0 transition-opacity sm:inline group-hover/move:opacity-100 group-focus-visible/move:opacity-100">
                ▶
              </span>
              <span className="sm:flex-1 sm:truncate">{move.label}</span>
              <span className={cn('font-pixel text-[9px]', used ? 'text-game-accent-text' : 'text-muted-foreground')}>
                {used ? '✓' : `${move.damage} DMG`}
              </span>
            </>
          );
          const className = cn(
            // Phones stack the damage under the name, so two columns never truncate it.
            'group/move lift flex h-full w-full flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2 rounded-xl border-2 px-3 py-3 pointer-coarse:py-3.5 text-left text-sm font-semibold focus-visible:outline-none',
            used
              ? 'border-border/60 bg-muted/30 text-muted-foreground'
              : 'border-border bg-background hover:border-game-pink focus-visible:border-game-pink',
          );
          return (
            <li key={move.id}>
              {move.copy ? (
                <button
                  type="button"
                  data-sfx="none"
                  className={className}
                  onClick={(e) => copyEmail(move, { x: e.clientX, y: e.clientY })}>
                  {body}
                </button>
              ) : (
                <a
                  href={move.href}
                  data-sfx="none"
                  data-cv={move.cv ? '' : undefined}
                  target={move.href?.startsWith('http') || move.cv ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={className}
                  onClick={() => strike(move)}>
                  {body}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type VictoryProps = {
  onRematch: () => void;
};

function Victory(props: VictoryProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
      <p className="font-pixel text-4xl text-game-accent-text sm:text-6xl [text-shadow:0_0_24px_var(--game-accent)]">
        Victory!
      </p>
      <p className="max-w-md text-sm text-muted-foreground sm:text-base">
        You recruited a Senior Product Engineer. {resumeData.availability}.
      </p>
      <p className="font-semibold">{contact.email}</p>
      <button
        type="button"
        data-sfx="none"
        onClick={props.onRematch}
        className="lift mt-1 rounded-xl border-2 border-border px-4 py-2 font-pixel text-[10px] uppercase tracking-widest hover:border-game-accent">
        ↻ Rematch
      </button>
    </motion.div>
  );
}
