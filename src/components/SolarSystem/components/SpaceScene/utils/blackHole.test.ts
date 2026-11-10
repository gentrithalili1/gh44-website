import { describe, expect, it } from "vitest";

import {
  getAheadAnchor,
  getEscape,
  getHoleScale,
  getJumpCenter,
  getJumpLift,
  getRestAnchor,
  getSceneWarp,
  HOLE_SKY_DIRECTION,
} from "./blackHole";

describe("getRestAnchor", () => {
  it("rests in the top right of the screen", () => {
    for (const isPhone of [true, false]) {
      const anchor = getRestAnchor(isPhone);

      expect(anchor.x).toBeGreaterThan(0);
      expect(anchor.y).toBeGreaterThan(0);
    }
  });
});

describe("getAheadAnchor", () => {
  it("is straight ahead, up in the windshield", () => {
    expect(getAheadAnchor(false)).toEqual({ x: 0, y: getJumpLift(false) * 2 });
    expect(getAheadAnchor(true).y).toBeGreaterThan(getAheadAnchor(false).y);
  });
});

describe("HOLE_SKY_DIRECTION", () => {
  it("is a direction: one unit long", () => {
    expect(Math.hypot(...HOLE_SKY_DIRECTION)).toBeCloseTo(1, 2);
  });
});

describe("getHoleScale", () => {
  it("rests at its own size and ends far larger, growing fastest at the end", () => {
    expect(getHoleScale(0)).toBe(1);
    expect(getHoleScale(0.5)).toBeLessThan(getHoleScale(1) / 4);
    expect(getHoleScale(1)).toBeGreaterThan(100);
  });
});

describe("getEscape", () => {
  it("drops the solar system away in the first moments, for good", () => {
    expect(getEscape(0)).toBe(0);
    expect(getEscape(0.035)).toBeCloseTo(0.5);
    expect(getEscape(0.07)).toBe(1);
    expect(getEscape(1)).toBe(1);
    expect(getJumpCenter(0.07)).toBeLessThan(1);
  });
});

describe("getSceneWarp", () => {
  it("takes the launch's warp or the jump's, whichever is further along", () => {
    expect(getSceneWarp({ warp: 0, jump: 0 })).toBe(0);
    expect(getSceneWarp({ warp: 0.6, jump: 0 })).toBe(0.6);
    expect(getSceneWarp({ warp: 0, jump: 0.5 })).toBe(1);
    expect(getSceneWarp({ warp: -0.1, jump: 0 })).toBe(0);
  });
});
