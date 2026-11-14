/** Fire-and-forget visual effects, drawn by the single <FxCanvas /> mounted in the layout. */

export interface BurstOptions {
  count?: number;
  spread?: number;
  colors?: string[];
}

export interface FxRenderer {
  ripple: (x: number, y: number, strength?: number) => void;
  burst: (x: number, y: number, opts?: BurstOptions) => void;
  confetti: (count?: number) => void;
  rainbow: (ms: number) => void;
}

let renderer: FxRenderer | null = null;

export function registerFx(r: FxRenderer | null): void {
  renderer = r;
}

export const fx: FxRenderer = {
  ripple: (x, y, strength) => renderer?.ripple(x, y, strength),
  burst: (x, y, opts) => renderer?.burst(x, y, opts),
  confetti: (count) => renderer?.confetti(count),
  rainbow: (ms) => renderer?.rainbow(ms),
};

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
