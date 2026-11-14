import { CHEST, CHEST_LID_ROWS } from '@/features/loot/loot.constants';
import type { Sprite } from '@/lib/pixel-art';

const EMPTY_ROW = '.'.repeat(CHEST[0].length);

/**
 * The chest in a rarity's trim colours, split into two full-size sprites (lid and base)
 * that stack exactly, so the lid can animate on its own.
 */
export function chestSprites(trim: readonly [string, string]): { lid: Sprite; base: Sprite } {
  const [main, dark] = trim;
  const tinted = CHEST.map((row) => row.replaceAll('r', main).replaceAll('R', dark));
  return {
    lid: tinted.map((row, y) => (y < CHEST_LID_ROWS ? row : EMPTY_ROW)),
    base: tinted.map((row, y) => (y < CHEST_LID_ROWS ? EMPTY_ROW : row)),
  };
}
