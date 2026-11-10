import { describe, expect, it } from "vitest";

import { getHoleScale, getJumpTurn, getSceneWarp } from "./blackHole";

describe("getHoleScale", () => {
  it("rests at its own size and ends far larger, growing fastest at the end", () => {
    expect(getHoleScale(0)).toBe(1);
    expect(getHoleScale(0.5)).toBeLessThan(getHoleScale(1) / 4);
    expect(getHoleScale(1)).toBeGreaterThan(100);
  });
});

describe("getJumpTurn", () => {
  it("has turned to face the hole early in the flight, and stays turned", () => {
    expect(getJumpTurn(0)).toBe(0);
    expect(getJumpTurn(0.15)).toBeCloseTo(0.5);
    expect(getJumpTurn(0.3)).toBe(1);
    expect(getJumpTurn(1)).toBe(1);
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
