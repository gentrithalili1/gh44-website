import { describe, expect, it } from "vitest";

import { findPlanet, type PlanetBody, PLANETS, SOLAR_SYSTEM } from "#/utils/planets";

import {
  getOrbitAngle,
  getOrbitSpeed,
  getSpinCopyOffsets,
  getSpinPeriod,
  getSpinWidth,
} from "./motion";
import { getSurfaceShapes } from "./surface";

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

describe("getSpinCopyOffsets", () => {
  // A copy shows when its shape reaches past the disc's edge.
  function countVisibleCopies({ planet, time }: { planet: PlanetBody; time: number }) {
    return getSurfaceShapes(planet)
      .filter((shape) => shape.shouldSpin)
      .map((shape) => {
        if (shape.kind !== "ellipse") throw new Error("Spinning features are ellipses");
        return getSpinCopyOffsets({ planet, time, spinWidth: getSpinWidth(planet) }).filter(
          (offset) => Math.abs(shape.x + offset) < planet.size + shape.rx,
        ).length;
      });
  }

  it("never shows two copies of the same feature on a planet, at any spin offset", () => {
    for (const planet of SOLAR_SYSTEM) {
      const period = getSpinPeriod(planet);
      for (let step = 0; step < 200; step++) {
        for (const count of countVisibleCopies({ planet, time: (period * step) / 200 })) {
          expect(count).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("brings every feature back onto the disc once per turn", () => {
    const jupiter = getPlanet("work");
    const period = getSpinPeriod(jupiter);
    const visibleSteps = Array.from(
      { length: 200 },
      (_, step) => countVisibleCopies({ planet: jupiter, time: (period * step) / 200 })[0],
    ).filter((count) => count === 1);

    expect(visibleSteps.length).toBeGreaterThan(100);
    expect(
      getSpinCopyOffsets({
        planet: jupiter,
        time: period * 1.25,
        spinWidth: getSpinWidth(jupiter),
      }),
    ).toEqual(
      getSpinCopyOffsets({
        planet: jupiter,
        time: period * 0.25,
        spinWidth: getSpinWidth(jupiter),
      }).map((offset) => expect.closeTo(offset)),
    );
  });
});
