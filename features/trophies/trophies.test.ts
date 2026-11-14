import { describe, expect, it } from 'vitest';
import { TRAFFIC, TROPHY_ART } from '@/features/trophies/trophies.constants';
import { PALETTE, SPRITE_SIZE, spriteToRuns } from '@/lib/pixel-art';
import { resumeData } from '@/lib/resume';

describe('trophy art', () => {
  it('has art for every trophy in the resume data', () => {
    for (const trophy of resumeData.trophies) expect(TROPHY_ART[trophy.id]).toBeDefined();
  });

  it.each(Object.entries(TROPHY_ART))('%s sprite is a 16×16 grid of palette colours', (_, { sprite }) => {
    expect(sprite).toHaveLength(SPRITE_SIZE);
    for (const row of sprite) {
      expect(row).toHaveLength(SPRITE_SIZE);
      for (const ch of row) expect(ch === '.' || ch in PALETTE).toBe(true);
    }
  });

  it('keeps the traffic chart within 0..1, peaking at the end', () => {
    expect(TRAFFIC.every((v) => v > 0 && v <= 1)).toBe(true);
    expect(TRAFFIC[TRAFFIC.length - 1]).toBe(Math.max(...TRAFFIC));
  });
});

describe('spriteToRuns', () => {
  it('merges same-colour neighbours and skips transparent pixels', () => {
    expect(spriteToRuns(['kkW.', '..aa'])).toEqual([
      { x: 0, y: 0, width: 2, fill: PALETTE.k },
      { x: 2, y: 0, width: 1, fill: PALETTE.W },
      { x: 2, y: 1, width: 2, fill: PALETTE.a },
    ]);
  });

  it('treats unknown characters as transparent', () => {
    expect(spriteToRuns(['?k'])).toEqual([{ x: 1, y: 0, width: 1, fill: PALETTE.k }]);
  });

  it('covers every opaque pixel exactly once', () => {
    for (const { sprite } of Object.values(TROPHY_ART)) {
      const opaque = sprite.join('').replaceAll('.', '').length;
      const covered = spriteToRuns(sprite).reduce((sum, r) => sum + r.width, 0);
      expect(covered).toBe(opaque);
    }
  });
});
