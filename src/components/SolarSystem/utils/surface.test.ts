import { describe, expect, it } from "vitest";

import { DECORATIVE_PLANETS, findPlanet } from "#/utils/planets";

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

  it("draws Earth's land and Jupiter's red spot as round features, apart from the bands", () => {
    const shapes = ["me", "work", "gh44-brain"].flatMap((id) => {
      const planet = findPlanet(id);
      if (!planet) throw new Error(`No planet ${id}`);
      return getSurfaceShapes(planet);
    });

    expect(shapes.filter((shape) => shape.kind === "ellipse").map((shape) => shape.id)).toEqual([
      "continent-0",
      "continent-1",
      "continent-2",
      "red-spot",
    ]);
  });

  it("gives Mercury a few darker crater spots", () => {
    const mercury = DECORATIVE_PLANETS.find((planet) => planet.id === "mercury");
    if (!mercury) throw new Error("No Mercury");
    const craters = getSurfaceShapes(mercury);

    expect(craters.length).toBeGreaterThanOrEqual(3);
    for (const crater of craters) {
      expect(crater.color).toBe("shadow");
      expect(crater.kind).toBe("ellipse");
    }
  });

  it("bands Venus softly", () => {
    const venus = DECORATIVE_PLANETS.find((planet) => planet.id === "venus");
    if (!venus) throw new Error("No Venus");
    const bands = getSurfaceShapes(venus).filter((shape) => shape.kind === "polygon");

    expect(bands.length).toBeGreaterThan(0);
    for (const band of bands) {
      expect(band.opacity).toBeLessThan(0.5);
    }
  });

  it("gives Venus a few faint cloud swirls", () => {
    const venus = DECORATIVE_PLANETS.find((planet) => planet.id === "venus");
    if (!venus) throw new Error("No Venus");
    const swirls = getSurfaceShapes(venus).filter((shape) => shape.kind === "ellipse");

    expect(swirls.length).toBeGreaterThanOrEqual(3);
    for (const swirl of swirls) {
      if (swirl.kind !== "ellipse") throw new Error("Venus' swirls are ellipses");
      expect(swirl.id).toMatch(/^swirl-/);
      expect(swirl.color).not.toBe("shadow");
      expect(swirl.opacity).toBeLessThanOrEqual(0.35);
      expect(swirl.rx).toBeGreaterThan(swirl.ry);
    }
  });
});
