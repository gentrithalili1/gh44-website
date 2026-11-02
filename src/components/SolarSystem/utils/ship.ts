import type { Point } from "../types";
import { getOrbitPosition } from "./space";

// The gh44 explorer orbits the sun in the gap between Mars' orbit (200) and Jupiter's (280). It
// starts up and to the left of the sun: clear of every planet in the still system, and on screen
// on any phone.
export const SHIP_ORBIT = { radius: 242, phase: -2.4 } as const;

// Radians per second: one lap in about 70 seconds, between Mars' pace and Jupiter's.
const SHIP_ORBIT_SPEED = 0.09;

// The ship is drawn this many times the size of its outline below.
export const SHIP_SCALE = 1.92;

// Where the ship is on its orbit (radians) after `time` seconds of the scene clock.
export function getShipAngle(time: number) {
  return SHIP_ORBIT.phase + SHIP_ORBIT_SPEED * time;
}

// The ship at `angle` on its orbit, nose along its direction of travel (clockwise on screen):
// headings turn clockwise from nose up.
export function getShipPose(angle: number) {
  return {
    ...getOrbitPosition({ radius: SHIP_ORBIT.radius, phase: angle }),
    heading: angle + Math.PI,
  };
}

export type ShipPose = ReturnType<typeof getShipPose>;

// The ship from above, nose up (`y` down), in system units: a hull with swept wings.
export const SHIP_HULL = [
  { x: 0, y: -7 },
  { x: 1.4, y: -4.5 },
  { x: 1.9, y: -0.5 },
  { x: 5.2, y: 3.4 },
  { x: 5.2, y: 5 },
  { x: 1.9, y: 4 },
  { x: 1.3, y: 6 },
  { x: -1.3, y: 6 },
  { x: -1.9, y: 4 },
  { x: -5.2, y: 5 },
  { x: -5.2, y: 3.4 },
  { x: -1.9, y: -0.5 },
  { x: -1.4, y: -4.5 },
] as const satisfies readonly Point[];

// The cockpit window near the nose.
export const SHIP_CANOPY = [
  { x: 0, y: -4.6 },
  { x: 0.9, y: -2.6 },
  { x: 0, y: -1.4 },
  { x: -0.9, y: -2.6 },
] as const satisfies readonly Point[];

// The engine's glow, just behind the tail.
export const SHIP_ENGINE = { x: 0, y: 7, radius: 4.5 } as const;

// From nose to the end of the glow, at the outline's own size.
export const SHIP_LENGTH = 17;
