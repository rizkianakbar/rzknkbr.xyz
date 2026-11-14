import { describe, expect, it } from 'vitest';
import { CHEST, TONE } from '@/features/loot/loot.constants';
import { chestSprites } from '@/features/loot/loot.lib';
import { PALETTE, SPRITE_SIZE } from '@/lib/pixel-art';
import { resumeData } from '@/lib/resume';

describe('loot data', () => {
  it('gives every project a video and a poster frame', () => {
    for (const project of resumeData.projects) {
      expect(project.video).toMatch(/\.mp4$/);
      expect(project.poster).toMatch(/^\/projects\/posters\/.+\.jpg$/);
    }
  });

  it('gives every side quest a status and a reward', () => {
    for (const quest of resumeData.sideQuests) {
      expect(['done', 'active']).toContain(quest.status);
      expect(quest.reward.length).toBeGreaterThan(0);
      expect(quest.image).toMatch(/^\/projects\/.+\.jpg$/);
    }
  });
});

describe('chestSprites', () => {
  it.each(Object.entries(TONE))('tints the %s chest with palette colours only', (_, tone) => {
    const { lid, base } = chestSprites(tone.trim);
    for (const sprite of [lid, base]) {
      expect(sprite).toHaveLength(SPRITE_SIZE);
      for (const row of sprite) {
        expect(row).toHaveLength(SPRITE_SIZE);
        for (const ch of row) expect(ch === '.' || ch in PALETTE).toBe(true);
      }
    }
  });

  it('splits into a lid and a base that stack back into the whole chest', () => {
    const { lid, base } = chestSprites(['y', 'Y']);
    const merged = lid.map((row, y) => [...row].map((ch, x) => (ch === '.' ? base[y][x] : ch)).join(''));
    const tinted = CHEST.map((row) => row.replaceAll('r', 'y').replaceAll('R', 'Y'));
    expect(merged).toEqual(tinted);
    expect(lid.slice(6).every((row) => /^\.+$/.test(row))).toBe(true);
    expect(base.slice(0, 6).every((row) => /^\.+$/.test(row))).toBe(true);
  });
});

describe('loot projects', () => {
  it('describes every project as an item: type, stat lines, flavour and owner', () => {
    for (const project of resumeData.projects) {
      expect(project.type.length).toBeGreaterThan(0);
      expect(project.stats.length).toBeGreaterThan(0);
      for (const stat of project.stats) expect(stat.startsWith('+')).toBe(true);
      expect(project.flavor.length).toBeGreaterThan(0);
      expect(project.boundTo.length).toBeGreaterThan(0);
    }
  });

  it('colours each product family by its brand', () => {
    const tones = Object.fromEntries(resumeData.projects.map((p) => [p.title, p.tone]));
    expect(tones).toEqual({
      'KBR Prime': 'red',
      'KBR ID': 'red',
      'Stiqy Dashboard': 'yellow',
      'Stiqy App': 'yellow',
      Stiqy: 'yellow',
      'Bumpies NFT': 'purple',
    });
  });

  it('no longer link out (the old sites are retired)', () => {
    for (const project of resumeData.projects) expect('href' in project).toBe(false);
  });
});
