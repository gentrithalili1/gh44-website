import { PerspectiveCamera } from "three";
import { describe, expect, it } from "vitest";

import { getOrbitPace, getPixelsPerUnit, toPlanePosition, toScenePosition } from "./sceneMath";

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

describe("toPlanePosition", () => {
  it("lays system points on the orbit plane, `y` toward the viewer and height up", () => {
    expect(toPlanePosition({ x: 3, y: 4 })).toEqual([3, 0, 4]);
    expect(toPlanePosition({ x: 3, y: 4, height: 5 })).toEqual([3, 5, 4]);
  });
});

describe("getPixelsPerUnit", () => {
  it("spans fewer pixels per unit the farther a point is from the camera", () => {
    const camera = new PerspectiveCamera(45, 1440 / 900, 1, 10000);
    camera.position.set(0, 500, 0);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const viewport = { width: 1440, height: 900 };

    const near = getPixelsPerUnit({ camera, viewport, position: [0, 250, 0] });
    const far = getPixelsPerUnit({ camera, viewport, position: [0, 0, 0] });
    expect(far).toBeCloseTo(900 / (2 * 500 * Math.tan(Math.PI / 8)));
    expect(near).toBeCloseTo(far * 2);
  });
});
