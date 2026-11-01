import { describe, expect, it } from "vitest";

import { findPlanet } from "#/utils/planets";

import { getBandOutline, getSurfaceShapes } from "./surface";

describe("getBandOutline", () => {
  it("follows the disc's edge between the two lines", () => {
    const points = getBandOutline({ radius: 10, top: -6, bottom: 0 });

    expect(points[0]).toEqual({ x: 8, y: -6 });
    expect(points.at(-1)).toEqual({ x: -8, y: -6 });
    for (const point of points) expect(Math.hypot(point.x, point.y)).toBeCloseTo(10);
  });
});

describe("getSurfaceShapes", () => {
  it("gives Jupiter sand bands and a red spot", () => {
    const jupiter = findPlanet("work");
    if (!jupiter) throw new Error("No Jupiter");
    const shapes = getSurfaceShapes(jupiter);

    expect(shapes.filter((shape) => shape.kind === "polygon").map((band) => band.color)).toEqual([
      "sand",
      "sand",
      "sand",
      "sand",
    ]);
    expect(shapes.filter((shape) => shape.color === "red")).toHaveLength(1);
  });

  it("gives Earth sage landmasses that stay on the planet", () => {
    const earth = findPlanet("me");
    if (!earth) throw new Error("No Earth");

    for (const shape of getSurfaceShapes(earth)) {
      if (shape.kind !== "ellipse") throw new Error("Earth's land is ellipses");
      expect(shape.color).toBe("sage");
      expect(Math.hypot(shape.x, shape.y) + Math.max(shape.rx, shape.ry)).toBeLessThan(earth.size);
    }
  });

  it("spins Earth's land and Jupiter's red spot, and keeps every band still", () => {
    const shapes = ["me", "work", "gh44-brain"].flatMap((id) => {
      const planet = findPlanet(id);
      if (!planet) throw new Error(`No planet ${id}`);
      return getSurfaceShapes(planet);
    });

    expect(shapes.filter((shape) => shape.shouldSpin).map((shape) => shape.id)).toEqual([
      "continent-0",
      "continent-1",
      "continent-2",
      "red-spot",
    ]);
  });
});
