'use client';

import {
  createContext,
  type JSX,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ACHIEVEMENTS, type Achievement, type AchievementId, levelFor, SECTIONS } from '@/lib/achievements';
import { fx } from '@/lib/fx';
import { play, setMuted as setAudioMuted, unlockAudio } from '@/lib/sound';

const STORAGE_KEY = 'rzk-game-v1';
const SESSION_KEY = 'rzk-started';

type Point = { x: number; y: number };

export type TrackEvent =
  | { kind: 'click' }
  | { kind: 'poke' }
  | { kind: 'note' }
  | { kind: 'quest'; key: string; total: number }
  | { kind: 'trophy'; key: string; total: number }
  | { kind: 'section'; key: string };

export interface Toast {
  id: number;
  kind: 'achievement' | 'level' | 'info';
  title: string;
  description: string;
  emoji: string;
}

interface FloatingXp {
  id: number;
  x: number;
  y: number;
  amount: number;
}

interface GameContextValue {
  xp: number;
  unlocked: AchievementId[];
  muted: boolean;
  started: boolean;
  toasts: Toast[];
  floating: FloatingXp[];
  start: () => void;
  toggleMute: () => void;
  award: (id: AchievementId, at?: Point) => void;
  gainXp: (amount: number, at?: Point) => void;
  track: (event: TrackEvent, at?: Point) => void;
  notify: (toast: Omit<Toast, 'id' | 'kind'>) => void;
  dismissToast: (id: number) => void;
  reset: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

interface Persisted {
  xp: number;
  unlocked: AchievementId[];
  muted: boolean;
  seen: string[];
}

function load(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Persisted>;
    const valid = new Set<string>(ACHIEVEMENTS.map((a) => a.id));
    return {
      xp: typeof data.xp === 'number' && data.xp >= 0 ? data.xp : 0,
      unlocked: Array.isArray(data.unlocked) ? (data.unlocked.filter((id) => valid.has(id)) as AchievementId[]) : [],
      muted: data.muted === true,
      seen: Array.isArray(data.seen) ? data.seen.filter((s): s is string => typeof s === 'string') : [],
    };
  } catch {
    return null;
  }
}

function save(data: Persisted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage blocked (private mode etc.): progress just won't persist.
  }
}

function hudPoint(): Point {
  return { x: typeof window === 'undefined' ? 0 : Math.min(window.innerWidth - 60, 200), y: 48 };
}

export function GameProvider({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
  const [xp, setXp] = useState(0);
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [floating, setFloating] = useState<FloatingXp[]>([]);

  const xpRef = useRef(0);
  const unlockedRef = useRef(new Set<AchievementId>());
  const seenRef = useRef(new Set<string>());
  const mutedRef = useRef(false);
  const counters = useRef({ clicks: 0, pokes: 0, notes: 0 });
  const startedAt = useRef<number | null>(null);
  const idRef = useRef(0);
  const loaded = useRef(false);

  const persist = useCallback(() => {
    if (!loaded.current) return;
    save({
      xp: xpRef.current,
      unlocked: [...unlockedRef.current],
      muted: mutedRef.current,
      seen: [...seenRef.current],
    });
  }, []);

  useEffect(() => {
    const data = load();
    if (data) {
      xpRef.current = data.xp;
      unlockedRef.current = new Set(data.unlocked);
      seenRef.current = new Set(data.seen);
      mutedRef.current = data.muted;
      setXp(data.xp);
      setUnlocked(data.unlocked);
      setMuted(data.muted);
      setAudioMuted(data.muted);
    }
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setStarted(true);
        startedAt.current = Date.now();
      }
    } catch {
      // ignore
    }
    loaded.current = true;
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-2), { ...toast, id }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const gainXp = useCallback(
    (amount: number, at?: Point) => {
      const before = levelFor(xpRef.current);
      xpRef.current += amount;
      setXp(xpRef.current);
      const after = levelFor(xpRef.current);

      const p = at ?? hudPoint();
      const id = ++idRef.current;
      setFloating((f) => [...f.slice(-6), { id, x: p.x, y: p.y, amount }]);
      window.setTimeout(() => setFloating((f) => f.filter((x) => x.id !== id)), 1100);

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
      const a: Achievement | undefined = ACHIEVEMENTS.find((x) => x.id === id);
      if (!a) return;
      unlockedRef.current.add(id);
      setUnlocked([...unlockedRef.current]);
      play('achievement');
      const p = at ?? { x: window.innerWidth / 2, y: 90 };
      fx.burst(p.x, p.y, { count: 30, spread: 7 });
      pushToast({ kind: 'achievement', title: a.title, description: a.description, emoji: a.emoji });
      gainXp(a.xp, at);
    },
    [gainXp, pushToast],
  );

  /** Returns true the first time a key is seen (persisted across visits). */
  const firstTime = useCallback((key: string) => {
    if (seenRef.current.has(key)) return false;
    seenRef.current.add(key);
    return true;
  }, []);

  const track = useCallback(
    (event: TrackEvent, at?: Point) => {
      switch (event.kind) {
        case 'click':
          counters.current.clicks++;
          if (counters.current.clicks >= 75) award('clicker', at);
          break;
        case 'poke':
          counters.current.pokes++;
          if (counters.current.pokes >= 10) award('poke', at);
          break;
        case 'note':
          counters.current.notes++;
          if (counters.current.notes >= 12) award('composer', at);
          break;
        case 'quest': {
          if (firstTime(`quest:${event.key}`)) gainXp(15, at);
          const opened = [...seenRef.current].filter((k) => k.startsWith('quest:')).length;
          if (opened >= 3) award('quest-reader', at);
          if (opened >= event.total) award('all-quests', at);
          persist();
          break;
        }
        case 'trophy': {
          if (firstTime(`trophy:${event.key}`)) gainXp(5, at);
          const clicked = [...seenRef.current].filter((k) => k.startsWith('trophy:')).length;
          if (clicked >= event.total) award('trophy-room', at);
          persist();
          break;
        }
        case 'section': {
          if (firstTime(`section:${event.key}`)) gainXp(10);
          const seen = SECTIONS.filter((s) => seenRef.current.has(`section:${s}`)).length;
          if (seen >= SECTIONS.length) award('explorer');
          if (event.key === 'contact' && startedAt.current && Date.now() - startedAt.current < 25_000) {
            award('speedrun');
          }
          persist();
          break;
        }
      }
    },
    [award, firstTime, gainXp, persist],
  );

  const start = useCallback(() => {
    unlockAudio();
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore
    }
    document.documentElement.dataset.started = '1';
    setStarted(true);
    startedAt.current = Date.now();
    play('start');
    window.setTimeout(() => award('press-start'), 900);
  }, [award]);

  const toggleMute = useCallback(() => {
    unlockAudio();
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    setAudioMuted(next);
    if (!next) play('toggle');
    persist();
  }, [persist]);

  const notify = useCallback((toast: Omit<Toast, 'id' | 'kind'>) => pushToast({ ...toast, kind: 'info' }), [pushToast]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

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

  const value = useMemo(
    () => ({
      xp,
      unlocked,
      muted,
      started,
      toasts,
      floating,
      start,
      toggleMute,
      award,
      gainXp,
      track,
      notify,
      dismissToast,
      reset,
    }),
    [
      xp,
      unlocked,
      muted,
      started,
      toasts,
      floating,
      start,
      toggleMute,
      award,
      gainXp,
      track,
      notify,
      dismissToast,
      reset,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
