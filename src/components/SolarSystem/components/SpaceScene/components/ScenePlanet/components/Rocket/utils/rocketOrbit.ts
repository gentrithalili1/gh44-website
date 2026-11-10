// Launched rockets climb from Mars' pad into one of three orbits, each in its own plane through
// the poles, so they spread round the planet instead of stacking.
const ORBIT_GAP = 8;
const ORBIT_STEP = 2;
const ORBIT_LANES = 3;
const ORBIT_SPEED = 0.6;
// The golden angle turns each new rocket's plane away from the last ones.
const PLANE_TURN = Math.PI * (3 - Math.sqrt(5));
// The climb from the pad up to its orbit.
export const CLIMB_SECONDS = 2.4;

export type RocketOrbit = { radius: number; speed: number; planeTurn: number };

type GetRocketOrbitParams = { id: number; planetSize: number };

export function getRocketOrbit({ id, planetSize }: GetRocketOrbitParams): RocketOrbit {
  const lane = id % ORBIT_LANES;

  return {
    radius: planetSize + ORBIT_GAP + lane * ORBIT_STEP,
    // Outer orbits are slower, like the moons'.
    speed: ORBIT_SPEED / (1 + lane * 0.3),
    planeTurn: id * PLANE_TURN,
  };
}

type GetRocketPositionParams = {
  orbit: RocketOrbit;
  planetSize: number;
  flightTime: number;
  // Radians round its orbit from the planet's top.
  angle: number;
};

// Where a rocket is, in its planet's space (`y` up), and how far through its climb (0 to 1). It
// starts straight up from the pad and eases out to its orbit.
export function getRocketPosition({
  orbit,
  planetSize,
  flightTime,
  angle,
}: GetRocketPositionParams) {
  const climb = Math.min(1, flightTime / CLIMB_SECONDS);
  const height = planetSize + (orbit.radius - planetSize) * (1 - (1 - climb) ** 3);
  const across = Math.sin(angle) * height;

  return {
    x: across * Math.cos(orbit.planeTurn),
    y: Math.cos(angle) * height,
    z: across * Math.sin(orbit.planeTurn),
    climb,
  };
}
