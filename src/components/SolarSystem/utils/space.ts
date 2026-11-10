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

// gh44-confirm's rocket stands on top of Mars, nose up; from tail to nose it is this tall.
export const ROCKET_HEIGHT = 4.8;
// The rocket's outline, nose up (`y` down), its tail at y = 0: a pointed nose, a straight body
// and two fins flaring out at the tail.
export const ROCKET_OUTLINE = [
  { x: 0, y: -ROCKET_HEIGHT },
  { x: 0.55, y: -4.1 },
  { x: 0.75, y: -3.3 },
  { x: 0.75, y: -1.4 },
  { x: 1.6, y: -0.3 },
  { x: 1.6, y: 0.2 },
  { x: 0.75, y: -0.35 },
  { x: -0.75, y: -0.35 },
  { x: -1.6, y: 0.2 },
  { x: -1.6, y: -0.3 },
  { x: -0.75, y: -1.4 },
  { x: -0.75, y: -3.3 },
  { x: -0.55, y: -4.1 },
] as const;
