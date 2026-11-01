import { describe, expect, it } from "vitest";

import { findPlanet, PLANETS } from "#/utils/planets";

import { getOrbitAngle, getOrbitSpeed, getSpinOffset } from "./motion";

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
    expect(getOrbitPeriod("confirm")).toBeCloseTo(51.7, 1);
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

describe("getSpinOffset", () => {
  it("slides Earth's surface across its disc in about 25 seconds, then wraps", () => {
    const earth = getPlanet("me");

    expect(getSpinOffset({ planet: earth, time: 0 })).toBe(0);
    expect(getSpinOffset({ planet: earth, time: 12.5 })).toBeCloseTo(earth.size);
    expect(getSpinOffset({ planet: earth, time: 25.5 })).toBeCloseTo(earth.size * 0.04);
    expect(getSpinOffset({ planet: earth, time: 30 })).toBeCloseTo(earth.size * 0.4);
  });

  it("spins Jupiter fastest and Mars slowest, apart from how fast they orbit", () => {
    const turnsAfterOneSecond = ["work", "gh44-theme", "gh44-brain", "me", "confirm"].map((id) => {
      const planet = getPlanet(id);
      return getSpinOffset({ planet, time: 1 }) / (2 * planet.size);
    });

    expect(turnsAfterOneSecond).toEqual([...turnsAfterOneSecond].sort((a, b) => b - a));
    expect(turnsAfterOneSecond[0]).toBeCloseTo(24 / 9.9 / 25, 3);
  });
});
