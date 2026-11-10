import { describe, expect, it } from "vitest";

import {
  getEscape,
  getHoleAnchor,
  getHoleScale,
  getJumpCenter,
  getJumpLift,
  getRestAnchor,
  getSceneWarp,
} from "./blackHole";

describe("getRestAnchor", () => {
  it("rests in the top right, further in with the cockpit open", () => {
    const home = getRestAnchor({ isCockpit: false, isPhone: false });
    const cockpit = getRestAnchor({ isCockpit: true, isPhone: false });

    expect(home.x).toBeGreaterThan(0);
    expect(home.y).toBeGreaterThan(0);
    expect(cockpit.x).toBeLessThan(home.x);
    expect(cockpit.x).toBeGreaterThan(0);
  });
});

describe("getHoleAnchor", () => {
  it("leaves its corner for dead ahead early in the flight, and stays there", () => {
    const rest = getRestAnchor({ isCockpit: true, isPhone: false });
    const ahead = { x: 0, y: getJumpLift(false) * 2 };

    expect(getHoleAnchor({ rest, jump: 0, isPhone: false })).toEqual(rest);
    expect(getHoleAnchor({ rest, jump: 0.14, isPhone: false })).toEqual(ahead);
    expect(getHoleAnchor({ rest, jump: 1, isPhone: false })).toEqual(ahead);
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
