import { describe, expect, it } from "vitest";

import { getOrbitPace, toScenePosition } from "./sceneMath";

describe("getOrbitPace", () => {
  it("orbits at full speed while nothing is open", () => {
    expect(getOrbitPace({ state: "idle", isHovered: false })).toBe(1);
  });

  it("stops a hovered planet", () => {
    expect(getOrbitPace({ state: "idle", isHovered: true })).toBe(0);
  });

  it("holds the open planet still and slows the others", () => {
    expect(getOrbitPace({ state: "current", isHovered: false })).toBe(0);
    expect(getOrbitPace({ state: "faded", isHovered: false })).toBe(0.25);
  });
});

describe("toScenePosition", () => {
  it("flips y to grow upward and puts depth toward the camera", () => {
    expect(toScenePosition({ x: 3, y: 4, depth: 5 })).toEqual([3, -4, 5]);
  });
});
