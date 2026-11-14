/** Each branch is its own instrument and colour. Literal classes so Tailwind can see them. */
export const BRANCHES = [
  {
    wave: 'triangle',
    text: 'text-game-accent-text',
    border: 'border-game-accent',
    fill: 'bg-game-accent',
    soft: 'bg-game-accent/10',
    glow: 'shadow-[0_0_14px_-3px_var(--game-accent)]',
  },
  {
    wave: 'sine',
    text: 'text-game-cyan',
    border: 'border-game-cyan',
    fill: 'bg-game-cyan',
    soft: 'bg-game-cyan/10',
    glow: 'shadow-[0_0_14px_-3px_var(--game-cyan)]',
  },
  {
    wave: 'square',
    text: 'text-game-violet',
    border: 'border-game-violet',
    fill: 'bg-game-violet',
    soft: 'bg-game-violet/10',
    glow: 'shadow-[0_0_14px_-3px_var(--game-violet)]',
  },
  {
    wave: 'triangle',
    text: 'text-game-pink',
    border: 'border-game-pink',
    fill: 'bg-game-pink',
    soft: 'bg-game-pink/10',
    glow: 'shadow-[0_0_14px_-3px_var(--game-pink)]',
  },
] as const satisfies readonly ({ wave: OscillatorType } & Record<
  'text' | 'border' | 'fill' | 'soft' | 'glow',
  string
>)[];

export type Branch = (typeof BRANCHES)[number];

/** Column centres of the 4-column grid, where the root's connector drops into each branch. */
export const CONNECTOR_DROPS = ['12.5%', '37.5%', '62.5%', '87.5%'];
