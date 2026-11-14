import { BATTLE_LINES, BOSS_HP } from '@/features/contact/contact.constants';

export type BattleMove = { id: string; damage: number; line: string };

export type BattleState = {
  hp: number;
  /** Moves that already landed: each move only deals damage once, so mashing one button won't win. */
  used: readonly string[];
  line: string;
};

export const INITIAL_BATTLE: BattleState = { hp: BOSS_HP, used: [], line: BATTLE_LINES.intro };

/** Applies one move. Returns the next state and how much damage actually landed (0 if none). */
export function applyMove(state: BattleState, move: BattleMove): { state: BattleState; dealt: number } {
  if (state.hp <= 0) return { state, dealt: 0 };
  if (state.used.includes(move.id)) return { state: { ...state, line: BATTLE_LINES.repeat }, dealt: 0 };

  const dealt = Math.min(move.damage, state.hp);
  const hp = state.hp - dealt;
  return {
    state: { hp, used: [...state.used, move.id], line: hp === 0 ? BATTLE_LINES.victory : move.line },
    dealt,
  };
}
