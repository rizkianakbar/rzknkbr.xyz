import { describe, expect, it } from 'vitest';
import { BATTLE_LINES, BOSS_HP, BOSS_SPRITE } from '@/features/contact/contact.constants';
import { applyMove, INITIAL_BATTLE } from '@/features/contact/contact.lib';
import { PALETTE, SPRITE_SIZE } from '@/lib/pixel-art';

const slash = { id: 'slash', damage: 40, line: 'Slash!' };
const zap = { id: 'zap', damage: 70, line: 'Zap!' };

describe('applyMove', () => {
  it('deals damage once per move and reports it', () => {
    const { state, dealt } = applyMove(INITIAL_BATTLE, slash);
    expect(dealt).toBe(40);
    expect(state).toEqual({ hp: BOSS_HP - 40, used: ['slash'], line: 'Slash!' });
  });

  it('ignores a move that already landed', () => {
    const once = applyMove(INITIAL_BATTLE, slash).state;
    const { state, dealt } = applyMove(once, slash);
    expect(dealt).toBe(0);
    expect(state.hp).toBe(once.hp);
    expect(state.line).toBe(BATTLE_LINES.repeat);
  });

  it('never drops below zero and ends in victory', () => {
    const afterSlash = applyMove(INITIAL_BATTLE, slash).state;
    const { state, dealt } = applyMove(afterSlash, zap);
    expect(dealt).toBe(60);
    expect(state.hp).toBe(0);
    expect(state.line).toBe(BATTLE_LINES.victory);
  });

  it('does nothing once the boss is down', () => {
    const won = { hp: 0, used: ['slash', 'zap'], line: BATTLE_LINES.victory };
    expect(applyMove(won, { id: 'new', damage: 10, line: 'x' })).toEqual({ state: won, dealt: 0 });
  });
});

describe('boss sprite', () => {
  it('is a 16×16 grid of palette colours', () => {
    expect(BOSS_SPRITE).toHaveLength(SPRITE_SIZE);
    for (const row of BOSS_SPRITE) {
      expect(row).toHaveLength(SPRITE_SIZE);
      for (const ch of row) expect(ch === '.' || ch in PALETTE).toBe(true);
    }
  });
});
