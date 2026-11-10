import { describe, expect, it } from "vitest";

import { getBank, getPlumeLength, mirrorOutline, WING_OUTLINE } from "./shipModel";

describe("mirrorOutline", () => {
  it("flips an outline across the body, keeping its winding", () => {
    const mirrored = mirrorOutline(WING_OUTLINE);

    expect(mirrored).toHaveLength(WING_OUTLINE.length);
    expect(mirrored.at(-1)).toEqual({ x: -1.2, y: -0.9 });
  });
});

describe("getPlumeLength", () => {
  it("grows with the flare, and furthest at full thrust", () => {
    const idle = getPlumeLength({ flare: 0, thrust: 0 });
    const flared = getPlumeLength({ flare: 1, thrust: 0 });
    const launching = getPlumeLength({ flare: 1, thrust: 1 });

    expect(flared).toBeGreaterThan(idle);
    expect(launching).toBeGreaterThan(flared);
    expect(getPlumeLength({ flare: 0, thrust: 1 })).toBe(launching);
  });
});

describe("getBank", () => {
  it("dips the inside wing, more for a faster turn", () => {
    expect(getBank(0)).toBe(-0);
    expect(getBank(1)).toBeLessThan(0);
    expect(getBank(-1)).toBeGreaterThan(0);
    expect(Math.abs(getBank(2))).toBeGreaterThan(Math.abs(getBank(1)));
  });

  it("never rolls past its limit", () => {
    expect(getBank(100)).toBe(getBank(1000));
  });
});
