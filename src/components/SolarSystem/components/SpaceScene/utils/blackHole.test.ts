import { describe, expect, it } from "vitest";

import {
  getAheadAnchor,
  getEscape,
  getHolePosition,
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

describe("getHolePosition", () => {
  it("is far past every orbit, below the orbit plane and behind the system", () => {
    for (const isPhone of [true, false]) {
      const [x, y, z] = getHolePosition(isPhone);

      expect(Math.hypot(x, y, z)).toBeGreaterThan(10000);
      // The home view looks down on the system: its top right is under the plane, behind it.
      expect(x).toBeGreaterThan(0);
      expect(y).toBeLessThan(0);
      expect(z).toBeLessThan(0);
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
  it("drops the solar system away in the first moments of the flight in, for good", () => {
    expect(getEscape({ jump: 0, homing: 0 })).toBe(0);
    expect(getEscape({ jump: 0.035, homing: 0 })).toBeCloseTo(0.5);
    expect(getEscape({ jump: 0.07, homing: 0 })).toBe(1);
    expect(getEscape({ jump: 1, homing: 0 })).toBe(1);
    expect(getJumpCenter(0.07)).toBeLessThan(1);
  });

  it("grows the solar system back ahead on the flight home", () => {
    expect(getEscape({ jump: 0, homing: 1 })).toBe(1);
    expect(getEscape({ jump: 0, homing: 0.4 })).toBeLessThan(1);
    expect(getEscape({ jump: 0, homing: 0.4 })).toBeGreaterThan(0);
    expect(getEscape({ jump: 0, homing: 0 })).toBe(0);
  });
});

describe("getSceneWarp", () => {
  it("takes the launch's warp, the jump's or the flight home's, whichever is further along", () => {
    expect(getSceneWarp({ warp: 0, jump: 0, homing: 0 })).toBe(0);
    expect(getSceneWarp({ warp: 0.6, jump: 0, homing: 0 })).toBe(0.6);
    expect(getSceneWarp({ warp: 0, jump: 0.5, homing: 0 })).toBe(1);
    expect(getSceneWarp({ warp: 0, jump: 0, homing: 0.6 })).toBe(1);
    expect(getSceneWarp({ warp: -0.1, jump: 0, homing: 0 })).toBe(0);
  });
});
