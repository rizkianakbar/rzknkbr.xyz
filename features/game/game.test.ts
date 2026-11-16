import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, GOALS, LEVELS, MAX_LEVEL, SECTIONS, XP_REWARD } from '@/features/game/game.constants';
import { countSeen, levelFor, levelProgress, parseProgress } from '@/features/game/game.lib';
import { resumeData } from '@/lib/resume';

describe('levelFor', () => {
  it('starts at level 1 with the next threshold', () => {
    expect(levelFor(0)).toEqual({ level: 1, title: 'Visitor', current: 0, next: 40 });
  });

  it('levels up exactly at the threshold', () => {
    expect(levelFor(39).level).toBe(1);
    expect(levelFor(40)).toEqual({ level: 2, title: 'Wanderer', current: 40, next: 120 });
  });

  it('caps at the max level with no next threshold', () => {
    const last = LEVELS[LEVELS.length - 1];
    expect(levelFor(last.xp)).toEqual({ level: MAX_LEVEL, title: last.title, current: last.xp, next: null });
    expect(levelFor(1_000_000).level).toBe(MAX_LEVEL);
  });
});

describe('levelProgress', () => {
  it('is the fraction through the current level', () => {
    expect(levelProgress(0)).toBe(0);
    expect(levelProgress(20)).toBe(0.5);
    expect(levelProgress(80)).toBe(0.5); // halfway from 40 to 120
  });

  it('is full at max level', () => {
    expect(levelProgress(10_000)).toBe(1);
  });
});

describe('parseProgress', () => {
  it('returns null for missing, broken or non-object data', () => {
    expect(parseProgress(null)).toBeNull();
    expect(parseProgress('')).toBeNull();
    expect(parseProgress('{not json')).toBeNull();
    expect(parseProgress('42')).toBeNull();
    expect(parseProgress('null')).toBeNull();
  });

  it('keeps valid data', () => {
    const raw = JSON.stringify({ xp: 120, unlocked: ['poke', 'cv'], muted: true, seen: ['section:hero'] });
    expect(parseProgress(raw)).toEqual({ xp: 120, unlocked: ['poke', 'cv'], muted: true, seen: ['section:hero'] });
  });

  it('drops unknown achievements, e.g. ones removed from the game', () => {
    const raw = JSON.stringify({ xp: 10, unlocked: ['poke', 'day-night', 7], muted: false, seen: [] });
    expect(parseProgress(raw)?.unlocked).toEqual(['poke']);
  });

  it('sanitizes bad field values', () => {
    const raw = JSON.stringify({ xp: -5, unlocked: 'poke', muted: 'yes', seen: ['ok', 1, null] });
    expect(parseProgress(raw)).toEqual({ xp: 0, unlocked: [], muted: false, seen: ['ok'] });
  });
});

describe('countSeen', () => {
  it('counts keys with the given prefix only', () => {
    const seen = new Set(['quest:A', 'quest:B', 'questionable', 'trophy:x', 'section:quest']);
    expect(countSeen(seen, 'quest')).toBe(2);
    expect(countSeen(seen, 'trophy')).toBe(1);
    expect(countSeen([], 'quest')).toBe(0);
  });
});

describe('game balance', () => {
  const achievementXp = ACHIEVEMENTS.reduce((sum, a) => sum + a.xp, 0);
  const secretXp = ACHIEVEMENTS.filter((a) => 'secret' in a && a.secret).reduce((sum, a) => sum + a.xp, 0);
  const exploringXp =
    SECTIONS.length * XP_REWARD.section +
    resumeData.work.length * XP_REWARD.quest +
    resumeData.trophies.length * XP_REWARD.trophy +
    resumeData.testimonials.length * XP_REWARD.testimonial;
  const maxXp = achievementXp + exploringXp;
  const legendXp = LEVELS[LEVELS.length - 1].xp;

  it('has unique achievement ids and ascending level thresholds', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    for (let i = 1; i < LEVELS.length; i++) expect(LEVELS[i].xp).toBeGreaterThan(LEVELS[i - 1].xp);
  });

  it('makes the final rank reachable', () => {
    expect(maxXp).toBeGreaterThanOrEqual(legendXp);
  });

  it('requires the secret for the final rank, as the quest board hints', () => {
    expect(maxXp - secretXp).toBeLessThan(legendXp);
  });

  it('gives every locked achievement a clue that differs from its answer', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.hint.length).toBeGreaterThan(0);
      expect(a.hint).not.toBe(a.description);
    }
  });

  it('keeps the quest-reader goal reachable', () => {
    expect(GOALS.questsRead).toBeLessThanOrEqual(resumeData.work.length);
  });
});
