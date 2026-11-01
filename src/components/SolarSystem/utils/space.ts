import type { PlanetState } from "../types";

// The system spans this many units across the shorter side of the screen.
export const SYSTEM_SIZE = 1040;
export const SUN_RADIUS = 56;
export const SUN_GLOW_RADIUS = 150;

// Moon, satellite and ring planes lean away from the viewer: a circle shows as an ellipse this
// many times as tall as it is wide.
export const ORBIT_TILT = 0.34;
const ORBIT_DEPTH = Math.sqrt(1 - ORBIT_TILT ** 2);

type Orbit = { radius: number; phase: number };

export function getOrbitPosition({ radius, phase }: Orbit) {
  return { x: Math.cos(phase) * radius, y: Math.sin(phase) * radius };
}

type GetTiltedPointParams = { radius: number; angle: number };

// A point on a tilted orbit. `y` grows downward on screen; `depth` grows toward the viewer, so the
// near half (below the planet's center) passes in front of it.
export function getTiltedPoint({ radius, angle }: GetTiltedPointParams) {
  const sin = Math.sin(angle);
  const depth = sin * radius * ORBIT_DEPTH;

  return { x: Math.cos(angle) * radius, y: sin * radius * ORBIT_TILT, depth, isInFront: depth > 0 };
}

type GetPlanetStateParams = {
  planetId: string;
  openPlanetId: string | undefined;
};

export function getPlanetState({ planetId, openPlanetId }: GetPlanetStateParams): PlanetState {
  if (openPlanetId === undefined) return "idle";

  return planetId === openPlanetId ? "current" : "faded";
}

// Mars' rocket circles flat around the planet, outside its satellites.
export const ROCKET_GAP = 20;
// The rocket's outline, nose up (`y` down); the nose reaches ROCKET_LENGTH past its center.
export const ROCKET_LENGTH = 3;
export const ROCKET_OUTLINE = [
  { x: 0, y: -3 },
  { x: 1.8, y: 1.8 },
  { x: 0, y: 0.9 },
  { x: -1.8, y: 1.8 },
] as const;

type GetRocketPoseParams = { planetSize: number; angle: number };

// The rocket's position and heading (radians, nose along its path).
export function getRocketPose({ planetSize, angle }: GetRocketPoseParams) {
  const distance = planetSize + ROCKET_GAP;

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    rotation: angle + Math.PI,
  };
}
