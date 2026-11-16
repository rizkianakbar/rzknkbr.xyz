/** A walkable top edge, in page (document) coordinates. `el` is null for the screen-bottom floor. */
export type Platform = { left: number; right: number; top: number; el: Element | null };

export const GRAVITY = 2600; // px/s²

/** Launch velocity for an arc that lands exactly `dx`, `dy` away (y grows downward) after `T` seconds. */
export function launch(dx: number, dy: number): { vx: number; vy: number; T: number } {
  const T = Math.min(Math.max(0.38 + Math.hypot(dx, dy) / 1800, 0.38), 0.85);
  return { vx: dx / T, vy: (dy - 0.5 * GRAVITY * T * T) / T, T };
}

export const clampX = (p: Platform, x: number, half: number) => Math.min(Math.max(x, p.left + half), p.right - half);

/** Where to land after the current platform scrolled away: near the bot's x, a bit above mid-screen; cards beat the floor. */
export function pickLanding(visible: Platform[], floor: Platform, x: number, idealY: number, half: number): Platform {
  let best = floor;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const p of visible) {
    const score = Math.abs(clampX(p, x, half) - x) + Math.abs(p.top - idealY) * 0.5;
    if (score < bestScore) {
      best = p;
      bestScore = score;
    }
  }
  return best;
}

/** The highest platform below the cursor, or the floor. */
export function platformUnder(visible: Platform[], floor: Platform, cx: number, cy: number): Platform {
  let best = floor;
  for (const p of visible) {
    if (cx >= p.left && cx <= p.right && p.top >= cy - 24 && p.top < best.top) best = p;
  }
  return best;
}
