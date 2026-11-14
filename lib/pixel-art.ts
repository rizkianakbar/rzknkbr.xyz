/** 16×16 pixel art: one string per row, one character per pixel ('.' is transparent). */
export type Sprite = readonly string[];

export const SPRITE_SIZE = 16;

/** Sprite palette, tied to the site's theme tokens so the art always matches the neon UI. */
export const PALETTE: Record<string, string> = {
  k: '#0b0b12', // outline
  a: 'var(--game-accent)',
  A: '#6f9a12',
  p: 'var(--game-pink)',
  P: '#c23a7f',
  c: 'var(--game-cyan)',
  C: '#1f9fb8',
  y: 'var(--game-amber)',
  Y: '#c98a0a',
  v: 'var(--game-violet)',
  V: '#6f55c8',
  w: '#ffffff',
  W: '#e7e4f2',
  g: '#8a879a',
  G: 'rgb(255 255 255 / 0.18)', // glass
  e: 'var(--game-red)',
  E: '#b3283a',
  b: '#8a5a32', // wood
  B: '#5a3820', // dark wood
};

type PixelRun = { x: number; y: number; width: number; fill: string };

/**
 * Turns a sprite into horizontal runs of same-coloured pixels, so a 16×16 sprite renders as
 * a few dozen <rect>s instead of up to 256. Unknown characters are treated as transparent.
 */
export function spriteToRuns(sprite: Sprite): PixelRun[] {
  const runs: PixelRun[] = [];
  sprite.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const key = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === key) end++;
      const fill = PALETTE[key];
      if (fill) runs.push({ x, y, width: end - x, fill });
      x = end;
    }
  });
  return runs;
}
