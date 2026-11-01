import { describe, expect, it } from "vitest";

import { getOrbitPosition, getTiltedPoint } from "./space";

describe("getOrbitPosition", () => {
  it("puts a planet on its orbit at the given angle, y growing downward", () => {
    const position = getOrbitPosition({ radius: 100, phase: Math.PI / 2 });

    expect(position.x).toBeCloseTo(0);
    expect(position.y).toBeCloseTo(100);
  });
});

describe("getTiltedPoint", () => {
  it("passes in front of the planet on the near side, below its center", () => {
    const point = getTiltedPoint({ radius: 10, angle: Math.PI / 2 });

    expect(point.x).toBeCloseTo(0);
    expect(point.y).toBeCloseTo(3.4);
    expect(point.isInFront).toBe(true);
  });

  it("passes behind the planet on the far side, above its center", () => {
    const point = getTiltedPoint({ radius: 10, angle: -Math.PI / 2 });

    expect(point.y).toBeCloseTo(-3.4);
    expect(point.isInFront).toBe(false);
  });

  it("keeps its full distance from the planet in 3D", () => {
    const point = getTiltedPoint({ radius: 10, angle: 1 });

    expect(Math.hypot(point.x, point.y, point.depth)).toBeCloseTo(10);
  });
});
