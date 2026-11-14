import { ACHIEVEMENTS, type AchievementId, LEVELS } from '@/features/game/game.constants';

export type LevelInfo = {
  level: number;
  title: string;
  /** XP where the current level starts. */
  current: number;
  /** XP needed for the next level, or null at max level. */
  next: number | null;
};

export function levelFor(xp: number): LevelInfo {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  return {
    level: i + 1,
    title: LEVELS[i].title,
    current: LEVELS[i].xp,
    next: i + 1 < LEVELS.length ? LEVELS[i + 1].xp : null,
  };
}

/** 0..1 progress through the current level (1 at max level). */
export function levelProgress(xp: number): number {
  const { current, next } = levelFor(xp);
  return next === null ? 1 : (xp - current) / (next - current);
}

export type Progress = {
  xp: number;
  unlocked: AchievementId[];
  muted: boolean;
  /** One-time keys like `section:hero` or `quest:KBR Media`, so XP isn't granted twice. */
  seen: string[];
};

const ACHIEVEMENT_IDS = new Set<string>(ACHIEVEMENTS.map((a) => a.id));

function isAchievementId(id: unknown): id is AchievementId {
  return typeof id === 'string' && ACHIEVEMENT_IDS.has(id);
}

/** Parses saved progress defensively: storage may hold old, partial or hand-edited data. */
export function parseProgress(raw: string | null): Progress | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return null;
    const { xp, unlocked, muted, seen } = data as Record<string, unknown>;
    return {
      xp: typeof xp === 'number' && Number.isFinite(xp) && xp >= 0 ? xp : 0,
      unlocked: Array.isArray(unlocked) ? unlocked.filter(isAchievementId) : [],
      muted: muted === true,
      seen: Array.isArray(seen) ? seen.filter((s): s is string => typeof s === 'string') : [],
    };
  } catch {
    return null;
  }
}

export function countSeen(seen: Iterable<string>, prefix: string): number {
  let n = 0;
  for (const key of seen) if (key.startsWith(`${prefix}:`)) n++;
  return n;
}

/** localStorage/sessionStorage can throw (private mode, blocked site data); progress just won't persist. */
export function readStorage(storage: 'local' | 'session', key: string): string | null {
  try {
    return (storage === 'local' ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(storage: 'local' | 'session', key: string, value: string): void {
  try {
    (storage === 'local' ? localStorage : sessionStorage).setItem(key, value);
  } catch {
    // ignore
  }
}
