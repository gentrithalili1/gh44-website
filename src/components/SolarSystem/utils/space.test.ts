import { describe, expect, it } from "vitest";

import { getPlanetReach } from "#/components/SolarSystem/components/SpaceScene/hooks/useCameraFlight/utils/cameraFraming";
import { SOLAR_SYSTEM } from "#/utils/planets";

import { getOrbitPosition, getTiltedPoint, SUN_RADIUS, SYSTEM_SIZE } from "./space";

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

describe("SOLAR_SYSTEM", () => {
  it("holds all eight planets in real order, outward from the sun", () => {
    expect(SOLAR_SYSTEM.map((planet) => planet.realPlanet)).toEqual([
      "mercury",
      "venus",
      "earth",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
    ]);
    const radii = SOLAR_SYSTEM.map((planet) => planet.orbit.radius);
    expect(radii).toEqual([...radii].sort((a, b) => a - b));
  });

  it("paints each planet in its gh44 palette color, like the illustrated system", () => {
    expect(SOLAR_SYSTEM.map((planet) => [planet.realPlanet, planet.color])).toEqual([
      ["mercury", "terracotta"],
      ["venus", "sand"],
      ["earth", "blue"],
      ["mars", "terracotta"],
      ["jupiter", "ochre"],
      ["saturn", "sand"],
      ["uranus", "seafoam"],
      ["neptune", "blue"],
    ]);
  });

  it("fits every planet and what orbits it between the sun and the screen's edge", () => {
    for (const planet of SOLAR_SYSTEM) {
      const reach = getPlanetReach(planet);
      expect(planet.orbit.radius - reach).toBeGreaterThan(SUN_RADIUS);
      expect(planet.orbit.radius + reach).toBeLessThanOrEqual(SYSTEM_SIZE / 2);
    }
  });
});
