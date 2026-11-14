'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fx } from '@/features/fx/fx.lib';
import {
  ACHIEVEMENTS,
  type AchievementId,
  GOALS,
  SECTIONS,
  STORAGE_KEYS,
  XP_REWARD,
} from '@/features/game/game.constants';
import { countSeen, levelFor, parseProgress, readStorage, writeStorage } from '@/features/game/game.lib';
import { play, setMuted as setAudioMuted, unlockAudio } from '@/features/sound/sound.lib';

type Point = { x: number; y: number };

type TrackEvent =
  | { kind: 'click' }
  | { kind: 'poke' }
  | { kind: 'note' }
  | { kind: 'quest'; key: string; total: number }
  | { kind: 'trophy'; key: string; total: number }
  | { kind: 'section'; key: string };

export type Toast = {
  id: number;
  kind: 'achievement' | 'level' | 'info';
  title: string;
  description: string;
  emoji: string;
};

type FloatingXp = { id: number; x: number; y: number; amount: number };

/** Stable callbacks: never change identity, so components that only act never re-render. */
type GameActions = {
  start: () => void;
  toggleMute: () => void;
  award: (id: AchievementId, at?: Point) => void;
  track: (event: TrackEvent, at?: Point) => void;
  notify: (toast: Omit<Toast, 'id' | 'kind'>) => void;
  dismissToast: (id: number) => void;
  reset: () => void;
};

/** Progress: changes on XP gains and unlocks. */
type GameState = {
  xp: number;
  unlocked: AchievementId[];
  muted: boolean;
  started: boolean;
};

/** Short-lived feedback: changes on every toast and floating "+XP", read only by the layers that draw it. */
type GameFeed = {
  toasts: Toast[];
  floating: FloatingXp[];
};

const ActionsContext = createContext<GameActions | null>(null);
const StateContext = createContext<GameState | null>(null);
const FeedContext = createContext<GameFeed | null>(null);

const TOAST_MS = 4200;
const FLOATING_XP_MS = 1100;

/** Where "+XP" floats up when there's no click position: next to the XP bar. */
function hudPoint(): Point {
  return { x: Math.min(window.innerWidth - 60, 200), y: 48 };
}

type GameProviderProps = {
  children: ReactNode;
};

export function GameProvider(props: GameProviderProps) {
  const [xp, setXp] = useState(0);
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [floating, setFloating] = useState<FloatingXp[]>([]);

  // Refs hold the source of truth so rapid events (many clicks per frame) never read stale state.
  const xpRef = useRef(0);
  const unlockedRef = useRef(new Set<AchievementId>());
  const seenRef = useRef(new Set<string>());
  const mutedRef = useRef(false);
  const counters = useRef({ clicks: 0, pokes: 0, notes: 0 });
  const startedAt = useRef<number | null>(null);
  const nextId = useRef(0);
  const loaded = useRef(false);

  const persist = useCallback(() => {
    if (!loaded.current) return;
    const progress = {
      xp: xpRef.current,
      unlocked: [...unlockedRef.current],
      muted: mutedRef.current,
      seen: [...seenRef.current],
    };
    writeStorage('local', STORAGE_KEYS.progress, JSON.stringify(progress));
  }, []);

  // Restore saved progress after hydration (storage isn't available during server render).
  useEffect(() => {
    const saved = parseProgress(readStorage('local', STORAGE_KEYS.progress));
    if (saved) {
      xpRef.current = saved.xp;
      unlockedRef.current = new Set(saved.unlocked);
      seenRef.current = new Set(saved.seen);
      mutedRef.current = saved.muted;
      setXp(saved.xp);
      setUnlocked(saved.unlocked);
      setMuted(saved.muted);
      setAudioMuted(saved.muted);
    }
    if (readStorage('session', STORAGE_KEYS.started)) {
      setStarted(true);
      startedAt.current = Date.now();
    }
    loaded.current = true;
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = ++nextId.current;
    setToasts((list) => [...list.slice(-2), { ...toast, id }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), TOAST_MS);
  }, []);

  const gainXp = useCallback(
    (amount: number, at?: Point) => {
      const before = levelFor(xpRef.current);
      xpRef.current += amount;
      setXp(xpRef.current);
      const after = levelFor(xpRef.current);

      const { x, y } = at ?? hudPoint();
      const id = ++nextId.current;
      setFloating((list) => [...list.slice(-6), { id, x, y, amount }]);
      window.setTimeout(() => setFloating((list) => list.filter((f) => f.id !== id)), FLOATING_XP_MS);

      if (after.level > before.level) {
        window.setTimeout(() => {
          play('levelUp');
          fx.confetti(120);
          pushToast({
            kind: 'level',
            title: `Level up! LV ${after.level}`,
            description: `New rank: ${after.title}.`,
            emoji: '⭐',
          });
        }, 350);
      }
      persist();
    },
    [persist, pushToast],
  );

  const award = useCallback(
    (id: AchievementId, at?: Point) => {
      if (unlockedRef.current.has(id)) return;
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (!achievement) return;
      unlockedRef.current.add(id);
      setUnlocked([...unlockedRef.current]);
      play('achievement');
      const { x, y } = at ?? { x: window.innerWidth / 2, y: 90 };
      fx.burst(x, y, { count: 30, spread: 7 });
      pushToast({
        kind: 'achievement',
        title: achievement.title,
        description: achievement.description,
        emoji: achievement.emoji,
      });
      gainXp(achievement.xp, at);
    },
    [gainXp, pushToast],
  );

  /** Grants XP the first time a key is seen, across visits. */
  const rewardOnce = useCallback(
    (key: string, amount: number, at?: Point) => {
      if (seenRef.current.has(key)) return;
      seenRef.current.add(key);
      gainXp(amount, at);
    },
    [gainXp],
  );

  const track = useCallback(
    (event: TrackEvent, at?: Point) => {
      const c = counters.current;
      switch (event.kind) {
        case 'click':
          if (++c.clicks >= GOALS.clicks) award('clicker', at);
          break;
        case 'poke':
          if (++c.pokes >= GOALS.pokes) award('poke', at);
          break;
        case 'note':
          if (++c.notes >= GOALS.notes) award('composer', at);
          break;
        case 'quest': {
          rewardOnce(`quest:${event.key}`, XP_REWARD.quest, at);
          const read = countSeen(seenRef.current, 'quest');
          if (read >= GOALS.questsRead) award('quest-reader', at);
          if (read >= event.total) award('all-quests', at);
          break;
        }
        case 'trophy':
          rewardOnce(`trophy:${event.key}`, XP_REWARD.trophy, at);
          if (countSeen(seenRef.current, 'trophy') >= event.total) award('trophy-room', at);
          break;
        case 'section': {
          rewardOnce(`section:${event.key}`, XP_REWARD.section);
          if (SECTIONS.every((s) => seenRef.current.has(`section:${s}`))) award('explorer');
          const elapsed = startedAt.current === null ? Number.POSITIVE_INFINITY : Date.now() - startedAt.current;
          if (event.key === 'contact' && elapsed < GOALS.speedrunMs) award('speedrun');
          break;
        }
      }
    },
    [award, rewardOnce],
  );

  const start = useCallback(() => {
    unlockAudio();
    writeStorage('session', STORAGE_KEYS.started, '1');
    document.documentElement.dataset.started = '1';
    setStarted(true);
    startedAt.current = Date.now();
    play('start');
    window.setTimeout(() => award('press-start'), 900);
  }, [award]);

  const toggleMute = useCallback(() => {
    unlockAudio();
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    setAudioMuted(mutedRef.current);
    if (!mutedRef.current) play('toggle');
    persist();
  }, [persist]);

  const notify = useCallback((toast: Omit<Toast, 'id' | 'kind'>) => pushToast({ ...toast, kind: 'info' }), [pushToast]);

  const dismissToast = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const reset = useCallback(() => {
    xpRef.current = 0;
    unlockedRef.current = new Set();
    seenRef.current = new Set();
    counters.current = { clicks: 0, pokes: 0, notes: 0 };
    setXp(0);
    setUnlocked([]);
    persist();
    play('close');
  }, [persist]);

  const actions = useMemo<GameActions>(
    () => ({ start, toggleMute, award, track, notify, dismissToast, reset }),
    [start, toggleMute, award, track, notify, dismissToast, reset],
  );
  const state = useMemo<GameState>(() => ({ xp, unlocked, muted, started }), [xp, unlocked, muted, started]);
  const feed = useMemo<GameFeed>(() => ({ toasts, floating }), [toasts, floating]);

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={state}>
        <FeedContext.Provider value={feed}>{props.children}</FeedContext.Provider>
      </StateContext.Provider>
    </ActionsContext.Provider>
  );
}

function useRequired<T>(context: React.Context<T | null>, name: string): T {
  const value = useContext(context);
  if (!value) throw new Error(`${name} must be used within GameProvider`);
  return value;
}

/** Callbacks only. Prefer this: it never causes a re-render. */
export function useGameActions() {
  return useRequired(ActionsContext, 'useGameActions');
}

export function useGameState() {
  return useRequired(StateContext, 'useGameState');
}

export function useGameFeed() {
  return useRequired(FeedContext, 'useGameFeed');
}
