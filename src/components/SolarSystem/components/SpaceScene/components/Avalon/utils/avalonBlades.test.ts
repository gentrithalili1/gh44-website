import { describe, expect, it } from "vitest";

import { BLADE, BLADE_COUNT, getBladePoint, getBladeShape, getBladeTurns } from "./avalonBlades";

describe("getBladeTurns", () => {
  it("sets the hulls evenly round the spine", () => {
    const turns = getBladeTurns();

    expect(turns).toHaveLength(BLADE_COUNT);
    expect(turns[0]).toBe(0);
    expect(turns[1]).toBeCloseTo((Math.PI * 2) / 3);
  });
});

describe("getBladePoint", () => {
  it("runs from the front tip to the back one, clear of the spine, bowing out in between", () => {
    const front = getBladePoint(0);
    const back = getBladePoint(1);
    const middle = getBladePoint(0.55);

    // Clear of the spine at both tips, further out at the back: it sweeps.
    expect(front).toEqual({ x: BLADE.front, y: BLADE.lift });
    expect(back.x).toBe(BLADE.back);
    expect(back.y).toBeCloseTo(BLADE.lift + BLADE.sweep);
    expect(middle.y).toBeGreaterThan(back.y);
  });
});

describe("getBladeShape", () => {
  it("closes the crescent outline", () => {
    const points = getBladeShape().getPoints();

    expect(points.length).toBeGreaterThan(30);
  });
});
