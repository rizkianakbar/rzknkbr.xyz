import type { Sprite } from '@/lib/pixel-art';

export const BOSS_HP = 100;

/** The final boss: a horned pixel monster in the site's violet and pink. */
export const BOSS_SPRITE: Sprite = [
  '................',
  '..kk........kk..',
  '..kpk......kpk..',
  '...kpkkkkkkpk...',
  '..kvvvvvvvvvvk..',
  '.kvvvvvvvvvvvvk.',
  '.kvwwkvvvvkwwvk.',
  '.kvwkkvvvvkkwvk.',
  '.kvvvvvvvvvvvvk.',
  '.kvvkwkwkwkwvvk.',
  '.kvvkkkkkkkkvvk.',
  '.kPvvvvvvvvvvPk.',
  '..kvvkvvvvkvvk..',
  '..kvk.kvvk.kvk..',
  '..kk..kkkk..kk..',
  '................',
];

export const BATTLE_LINES = {
  intro: 'A wild opportunity appears! It looks like it wants to build something. What will you do?',
  repeat: 'You already used that move. Try a different one!',
  victory: 'The boss was defeated! You unlocked a new teammate.',
} as const;
