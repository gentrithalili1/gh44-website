import { Object3D, PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { getOrbitPace, getPixelsPerUnit, getPlaneYaw, toPlanePosition } from "./sceneMath";

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

describe("toPlanePosition", () => {
  it("lays system points on the orbit plane, `y` toward the viewer", () => {
    expect(toPlanePosition({ x: 3, y: 4 })).toEqual([3, 0, 4]);
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

describe("getPlaneYaw", () => {
  it("turns a model's nose (-z) to a heading, clockwise from up on the home view", () => {
    const model = new Object3D();
    const nose = new Vector3();

    for (const [heading, expected] of [
      [0, toPlanePosition({ x: 0, y: -1 })],
      [Math.PI / 2, toPlanePosition({ x: 1, y: 0 })],
      [Math.PI, toPlanePosition({ x: 0, y: 1 })],
    ] as const) {
      model.rotation.y = getPlaneYaw(heading);
      model.updateMatrixWorld();
      nose.set(0, 0, -1).applyQuaternion(model.quaternion);
      expect(nose.x).toBeCloseTo(expected[0]);
      expect(nose.z).toBeCloseTo(expected[2]);
    }
  });
});
