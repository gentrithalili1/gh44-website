import type { Planet, RealPlanet } from "#/utils/planets";

type PlanetMotion = {
  // Relative animation speed around the sun: a visual multiplier, not astronomical.
  orbitMultiplier: number;
  // Length of one turn on its own axis, in hours; negative turns the other way.
  dayHours: number;
};

// How every real planet moves: closer planets orbit faster, and each spins at its own pace.
const PLANET_MOTION = {
  mercury: { orbitMultiplier: 100, dayHours: 1407.6 },
  venus: { orbitMultiplier: 75, dayHours: -5832.5 },
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

export function getOrbitSpeed(planet: Planet) {
  const scale =
    PLANET_MOTION[planet.realPlanet].orbitMultiplier / PLANET_MOTION.earth.orbitMultiplier;

  return EARTH_ORBIT_SPEED * scale;
}

type PlanetTimeParams = {
  planet: Planet;
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

// How far a planet's surface slides before it wraps around: one disc width.
export function getSpinWidth(planet: Planet) {
  return 2 * planet.size;
}

// How far a planet's surface features have slid right (system units) after `time` seconds,
// wrapping every disc width, like a turning globe seen from above.
export function getSpinOffset({ planet, time }: PlanetTimeParams) {
  const period =
    (EARTH_SPIN_PERIOD * PLANET_MOTION[planet.realPlanet].dayHours) / PLANET_MOTION.earth.dayHours;
  const turns = time / period;

  return (turns - Math.floor(turns)) * getSpinWidth(planet);
}
