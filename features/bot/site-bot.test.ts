import { describe, expect, it } from 'vitest';
import { GRAVITY, launch, type Platform, pickLanding, platformUnder } from '@/features/bot/site-bot.lib';

const card = (left: number, right: number, top: number): Platform => ({ left, right, top, el: null });
const floor = card(0, 1000, 900);

describe('site bot', () => {
  it('lands exactly on target, up or down', () => {
    for (const [dx, dy] of [
      [300, -200],
      [-120, 400],
      [0, 0],
    ]) {
      const { vx, vy, T } = launch(dx, dy);
      expect(vx * T).toBeCloseTo(dx);
      expect(vy * T + 0.5 * GRAVITY * T * T).toBeCloseTo(dy);
    }
  });

  it('picks the card under the cursor, else the floor', () => {
    const a = card(0, 400, 300);
    const b = card(0, 400, 600);
    expect(platformUnder([a, b], floor, 200, 250)).toBe(a);
    expect(platformUnder([a, b], floor, 200, 450)).toBe(b);
    expect(platformUnder([a, b], floor, 700, 250)).toBe(floor);
  });

  it('relocates to a nearby card before the floor', () => {
    const near = card(100, 500, 500);
    const far = card(800, 1000, 500);
    expect(pickLanding([far, near], floor, 300, 500, 20)).toBe(near);
    expect(pickLanding([], floor, 300, 500, 20)).toBe(floor);
  });
});
