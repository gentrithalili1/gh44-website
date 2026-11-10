import { describe, expect, it } from "vitest";

import { SOLAR_SYSTEM } from "#/utils/planets";

import { getSurfaceLook } from "./surfaceLook";

describe("getSurfaceLook", () => {
  it("keeps land still: only planets without relief let their weather drift", () => {
    for (const planet of SOLAR_SYSTEM) {
      const look = getSurfaceLook(planet.realPlanet);

      if (look.relief > 0) expect(look.drift).toBe(0);
    }
  });

  it("gives Earth alone clouds, a glint on its water and city lights", () => {
    const withWeather = SOLAR_SYSTEM.filter((planet) => {
      const look = getSurfaceLook(planet.realPlanet);

      return look.clouds > 0 && look.glint > 0 && look.nightLights > 0;
    });

    expect(withWeather.map((planet) => planet.realPlanet)).toEqual(["earth"]);
  });

  it("leaves airless Mercury without a glow", () => {
    expect(getSurfaceLook("mercury").air).toBe(0);
  });
});
