import { describe, expect, it } from "vitest";

import { CLIMB_SECONDS, getRocketOrbit, getRocketPosition } from "./rocketOrbit";

const MARS_SIZE = 10;

describe("getRocketOrbit", () => {
  it("spreads rockets over three orbits, each in a new plane", () => {
    const orbits = [1, 2, 3, 4].map((id) => getRocketOrbit({ id, planetSize: MARS_SIZE }));

    expect(orbits.map((orbit) => orbit.radius)).toEqual([20, 22, 18, 20]);
    expect(new Set(orbits.map((orbit) => orbit.planeTurn)).size).toBe(4);
  });
});

describe("getRocketPosition", () => {
  const orbit = getRocketOrbit({ id: 1, planetSize: MARS_SIZE });

  it("starts on the pad, on top of the planet", () => {
    const position = getRocketPosition({ orbit, planetSize: MARS_SIZE, flightTime: 0, angle: 0 });

    expect(Math.hypot(position.x, position.z)).toBe(0);
    expect(position).toMatchObject({ y: MARS_SIZE, climb: 0 });
  });

  it("holds its orbit once the climb is over", () => {
    for (const angle of [0.5, 2, 4]) {
      const position = getRocketPosition({
        orbit,
        planetSize: MARS_SIZE,
        flightTime: CLIMB_SECONDS + 5,
        angle,
      });

      expect(Math.hypot(position.x, position.y, position.z)).toBeCloseTo(orbit.radius);
      expect(position.climb).toBe(1);
    }
  });
});
