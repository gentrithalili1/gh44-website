import { describe, expect, it } from "vitest";

import { findPlanet, PLANETS, SOLAR_SYSTEM } from "#/utils/planets";

import { getOrbitAngle, getOrbitSpeed, getSpinPeriod } from "./motion";

function getPlanet(id: string) {
  const planet = findPlanet(id);
  if (!planet) throw new Error(`No planet ${id}`);
  return planet;
}

function getOrbitPeriod(id: string) {
  return (2 * Math.PI) / getOrbitSpeed(getPlanet(id));
}

describe("getOrbitSpeed", () => {
  it("moves Earth one full orbit in about 42 seconds", () => {
    expect(getOrbitPeriod("me")).toBeCloseTo(41.9, 1);
  });

  it("scales every planet from Earth by its relative orbit speed", () => {
    expect(getOrbitPeriod("gh44-confirm")).toBeCloseTo(51.7, 1);
    expect(getOrbitPeriod("work")).toBeCloseTo(94.2, 1);
    expect(getOrbitPeriod("gh44-theme")).toBeCloseTo(125.7, 1);
    expect(getOrbitPeriod("gh44-brain")).toBeCloseTo(239.9, 1);
  });

  it("moves every planet slower than the one inside it", () => {
    const speeds = PLANETS.map((planet) => getOrbitSpeed(planet));

    expect(speeds).toEqual([...speeds].sort((a, b) => b - a));
    expect(new Set(speeds).size).toBe(PLANETS.length);
  });
});

describe("getOrbitAngle", () => {
  it("starts a planet at its phase", () => {
    const jupiter = getPlanet("work");

    expect(getOrbitAngle({ planet: jupiter, time: 0 })).toBe(jupiter.orbit.phase);
  });

  it("brings Earth back around after one orbit", () => {
    const earth = getPlanet("me");
    const angle = getOrbitAngle({ planet: earth, time: 41.888 });

    expect(angle - earth.orbit.phase).toBeCloseTo(2 * Math.PI, 2);
  });
});

describe("getSpinPeriod", () => {
  it("turns Earth once in 25 seconds and every other planet by its day length", () => {
    expect(getSpinPeriod(getPlanet("me"))).toBe(25);
    expect(getSpinPeriod(getPlanet("work"))).toBeCloseTo((25 * 9.9) / 24);
  });

  it("spins Jupiter fastest and Mars slowest, apart from how fast they orbit", () => {
    const periods = ["work", "gh44-theme", "gh44-brain", "me", "gh44-confirm"].map((id) =>
      getSpinPeriod(getPlanet(id)),
    );

    expect(periods).toEqual([...periods].sort((a, b) => a - b));
  });

  it("turns Venus' clouds backwards, against Earth, fast enough to see within a minute or two", () => {
    const venus = SOLAR_SYSTEM.find((planet) => planet.id === "venus");
    if (!venus) throw new Error("No Venus");
    const period = getSpinPeriod(venus);

    expect(Math.sign(period)).toBe(-Math.sign(getSpinPeriod(getPlanet("me"))));
    expect(Math.abs(period)).toBe(100);
  });
});
