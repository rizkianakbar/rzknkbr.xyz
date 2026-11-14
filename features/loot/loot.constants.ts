import type { Sprite } from '@/lib/pixel-art';

/** Clipboard with a medical cross: stands in for side quests that have no screenshot yet. */
export const CLINIC_SPRITE: Sprite = [
  '................',
  '.....kkkkkk.....',
  '..kkkkWWWWkkkk..',
  '..kggkkkkkkggk..',
  '..kgWWWWWWWWgk..',
  '..kgWWWppWWWgk..',
  '..kgWWWppWWWgk..',
  '..kgWppppppWgk..',
  '..kgWppppppWgk..',
  '..kgWWWppWWWgk..',
  '..kgWWWppWWWgk..',
  '..kgWWWWWWWWgk..',
  '..kgWccccccWgk..',
  '..kgWWWWWWWWgk..',
  '..kkkkkkkkkkkk..',
  '................',
];

/**
 * Treasure chest, drawn as lid (rows 0–5) and base (rows 6–15) so the lid can fly off.
 * 'r'/'R' are placeholder trim colours, swapped per rarity by `chestSprites`.
 */
export const CHEST: Sprite = [
  '................',
  '..kkkkkkkkkkkk..',
  '.kbbbbrrrrbbbbk.',
  '.kbbbbrrrrbbbbk.',
  '.krrrrrrrrrrrrk.',
  '.kBBBBRwwRBBBBk.',
  '.kkkkkRwwRkkkkk.',
  '.kbbbbRRRRbbbbk.',
  '.kbbbbbRRbbbbbk.',
  '.kbbbbbbbbbbbbk.',
  '.krrrrrrrrrrrrk.',
  '.kbbbbbbbbbbbbk.',
  '.kBBBBBBBBBBBBk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
];

/** Last row of the lid; everything below is the base. */
export const CHEST_LID_ROWS = 6;

/** Rarity: how special the drop feels (label, sound, how big the burst is). */
export const RARITY = {
  legendary: { label: '★ Legendary', sound: 'secret', noteBase: 7, burst: 60, confetti: true },
  epic: { label: '◆ Epic', sound: 'achievement', noteBase: 5, burst: 40, confetti: false },
  rare: { label: '● Rare', sound: 'coin', noteBase: 3, burst: 30, confetti: false },
} as const;

/** Brand colour per product family, as literal classes so Tailwind can see them. */
export const TONE = {
  red: {
    trim: ['e', 'E'],
    ring: 'var(--game-red)',
    text: 'text-game-red',
    border: 'border-game-red',
    frame: 'border-game-red/50',
    beam: 'from-game-red/70',
    glow: 'bg-game-red/25',
    cardGlow: 'shadow-[0_0_40px_-14px_var(--game-red)]',
    burst: ['#ff4d5e', '#ffc2c8', '#ff8a96', '#ffffff'],
  },
  yellow: {
    trim: ['y', 'Y'],
    ring: 'var(--game-amber)',
    text: 'text-game-amber',
    border: 'border-game-amber',
    frame: 'border-game-amber/50',
    beam: 'from-game-amber/70',
    glow: 'bg-game-amber/25',
    cardGlow: 'shadow-[0_0_40px_-14px_var(--game-amber)]',
    burst: ['#ffc83d', '#fff1b8', '#ffb800', '#ffffff'],
  },
  purple: {
    trim: ['v', 'V'],
    ring: 'var(--game-violet)',
    text: 'text-game-violet',
    border: 'border-game-violet',
    frame: 'border-game-violet/50',
    beam: 'from-game-violet/70',
    glow: 'bg-game-violet/25',
    cardGlow: 'shadow-[0_0_40px_-14px_var(--game-violet)]',
    burst: ['#a98bff', '#e0d6ff', '#c3b0ff', '#ffffff'],
  },
} as const;
