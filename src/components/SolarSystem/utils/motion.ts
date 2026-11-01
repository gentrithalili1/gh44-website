import type { PlanetBody, RealPlanet } from "#/utils/planets";

import { getSurfaceShapes } from "./surface";

type PlanetMotion = {
  // Relative animation speed around the sun: a visual multiplier, not astronomical.
  orbitMultiplier: number;
  // Length of one turn on its own axis, in hours; negative turns the other way.
  dayHours: number;
};

// How every real planet moves: closer planets orbit faster, and each spins at its own pace.
const PLANET_MOTION = {
  mercury: { orbitMultiplier: 100, dayHours: 1407.6 },
  // Its cloud tops, not its ground: they race around backwards in about four days, where the
  // ground takes 243.
  venus: { orbitMultiplier: 75, dayHours: -96 },
  earth: { orbitMultiplier: 63, dayHours: 24 },
  mars: { orbitMultiplier: 51, dayHours: 24.6 },
  jupiter: { orbitMultiplier: 28, dayHours: 9.9 },
  saturn: { orbitMultiplier: 21, dayHours: 10.7 },
  uranus: { orbitMultiplier: 15, dayHours: -17.2 },
  neptune: { orbitMultiplier: 11, dayHours: 16.1 },
} as const satisfies Record<RealPlanet, PlanetMotion>;

// Earth's angular speed (radians per second): one orbit in about 42 seconds. The rest scale
// from it by their orbit multiplier.
const EARTH_ORBIT_SPEED = 0.15;

export function getOrbitSpeed(planet: PlanetBody) {
  const scale =
    PLANET_MOTION[planet.realPlanet].orbitMultiplier / PLANET_MOTION.earth.orbitMultiplier;

  return EARTH_ORBIT_SPEED * scale;
}

type PlanetTimeParams = {
  planet: PlanetBody;
  // Seconds of motion, from the scene clock.
  time: number;
};

// Where a planet is on its orbit (radians) after `time` seconds.
export function getOrbitAngle({ planet, time }: PlanetTimeParams) {
  return planet.orbit.phase + getOrbitSpeed(planet) * time;
}

// Seconds Earth's surface takes to slide once across its disc; every other planet scales from
// it by its day length.
const EARTH_SPIN_PERIOD = 25;

// Seconds one turn on its own axis takes; negative turns the other way.
export function getSpinPeriod(planet: PlanetBody) {
  return (
    (EARTH_SPIN_PERIOD * PLANET_MOTION[planet.realPlanet].dayHours) / PLANET_MOTION.earth.dayHours
  );
}

// Half the width of a planet's widest spinning feature.
function getWidestFeatureReach(planet: PlanetBody) {
  const reaches = getSurfaceShapes(planet)
    .filter((shape) => shape.shouldSpin)
    .map((shape) => {
      switch (shape.kind) {
        case "ellipse":
          return shape.rx;
        case "polygon": {
          const xs = shape.points.map((point) => point.x);
          return (Math.max(...xs) - Math.min(...xs)) / 2;
        }
        default: {
          const unknownShape: never = shape;
          return unknownShape;
        }
      }
    });

  return Math.max(0, ...reaches);
}

// How far a planet's surface slides before it wraps around: the disc's width plus its widest
// feature's. Wrapping at the disc's width alone shows a feature twice while it crosses the edge:
// part leaving one side, part coming back at the other. It builds the surface shapes: compute it
// once per planet, not every frame.
export function getSpinWidth(planet: PlanetBody) {
  return 2 * (planet.size + getWidestFeatureReach(planet));
}

// Where the two copies of a planet's surface features sit (system units, right of center) after
// `time` seconds, like a turning globe seen from above: the trailing copy follows one spin width
// behind the leading one, so a feature leaving one edge comes back in at the other.
export function getSpinCopyOffsets({
  planet,
  time,
  spinWidth,
}: PlanetTimeParams & { spinWidth: number }) {
  const turns = time / getSpinPeriod(planet);
  const lead = (turns - Math.floor(turns)) * spinWidth;

  return [lead, lead - spinWidth] as const;
}
