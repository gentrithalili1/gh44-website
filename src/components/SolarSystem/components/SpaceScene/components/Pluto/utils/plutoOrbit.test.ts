import { describe, expect, it } from "vitest";

import { SOLAR_SYSTEM } from "#/utils/planets";

import { getPlutoAngle, PLUTO } from "./plutoOrbit";

describe("plutoOrbit", () => {
  it("orbits past every planet", () => {
    const farthest = Math.max(...SOLAR_SYSTEM.map((planet) => planet.orbit.radius + planet.size));

    expect(PLUTO.orbitRadius - PLUTO.radius).toBeGreaterThan(farthest);
  });

  it("moves on with the scene clock", () => {
    expect(getPlutoAngle(0)).toBe(PLUTO.phase);
    expect(getPlutoAngle(10)).toBeGreaterThan(getPlutoAngle(0));
  });
});
