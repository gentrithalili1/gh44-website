import { describe, expect, it } from "vitest";

import {
  getAheadAnchor,
  getEscape,
  getHoleDirections,
  getHoleScale,
  getJumpCenter,
  getJumpLift,
  getSceneWarp,
} from "./blackHole";

describe("getAheadAnchor", () => {
  it("is straight ahead, up in the windshield", () => {
    expect(getAheadAnchor(false)).toEqual({ x: 0, y: getJumpLift(false) * 2 });
    expect(getAheadAnchor(true).y).toBeGreaterThan(getAheadAnchor(false).y);
  });
});

describe("getHoleDirections", () => {
  it("gives directions one unit long, below the orbit plane outside the ship", () => {
    for (const isPhone of [true, false]) {
      const { home, cockpit } = getHoleDirections(isPhone);

      expect(Math.hypot(...home)).toBeCloseTo(1, 2);
      expect(Math.hypot(...cockpit)).toBeCloseTo(1, 2);
      // The home view looks down on the system: its top right is under the plane, behind it.
      expect(home[1]).toBeLessThan(0);
      expect(home[2]).toBeLessThan(0);
    }
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
