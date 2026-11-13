import type { Point } from "#/components/SolarSystem/types";

// The fuselage's radius along its length, nose to tail: spun round its axis.
export const FUSELAGE_PROFILE = [
  { x: 0, y: -7 },
  { x: 0.55, y: -6.2 },
  { x: 1.15, y: -4.6 },
  { x: 1.7, y: -2 },
  { x: 1.85, y: 1 },
  { x: 1.6, y: 4 },
  { x: 1.25, y: 6 },
] as const satisfies readonly Point[];
// Flatter than it is wide.
export const FUSELAGE_FLATTEN = 0.72;

// One swept wing from above (`x` out from the body, `y` toward the tail); the other mirrors it.
export const WING_OUTLINE = [
  { x: 1.2, y: -0.9 },
  { x: 5.2, y: 3.4 },
  { x: 5.2, y: 5 },
  { x: 1.2, y: 4 },
] as const satisfies readonly Point[];
export const WING_THICKNESS = 0.3;

// The tail fin from the side (`x` toward the tail, `y` up).
export const FIN_OUTLINE = [
  { x: 2.6, y: 0.9 },
  { x: 5.6, y: 3.3 },
  { x: 6.3, y: 3.3 },
  { x: 5.8, y: 0.9 },
] as const satisfies readonly Point[];
export const FIN_THICKNESS = 0.25;

// The canopy: a glass bubble on the nose.
export const CANOPY = { y: 0.85, z: -3.1, width: 0.85, height: 0.65, length: 1.8 } as const;

// The engine's nozzle at the tail, and the wingtip lights.
export const NOZZLE = { z: 6.3, radius: 1.15, length: 0.9 } as const;
export const WINGTIP = { x: 5.2, y: 0.25, z: 4.2, radius: 0.32 } as const;

export function mirrorOutline(points: readonly Point[]): Point[] {
  return points.map((point) => ({ x: -point.x, y: point.y })).reverse();
}

// The plume is this long (ship units) with the engine idling, flared and at full launch thrust.
const PLUME_IDLE = 3.5;
const PLUME_FLARED = 6.5;
const PLUME_LAUNCH = 17;

type GetPlumeLengthParams = {
  // 0 idle to 1 flared (hovered, cockpit open, in flight).
  flare: number;
  // 0 to 1: how hard the ship is launching.
  thrust: number;
};

export function getPlumeLength({ flare, thrust }: GetPlumeLengthParams) {
  const cruising = PLUME_IDLE + (PLUME_FLARED - PLUME_IDLE) * flare;

  return cruising + (PLUME_LAUNCH - cruising) * thrust;
}

// The most the ship rolls into a turn (radians), and how much per radian a second it turns.
const BANK_MAX = 0.7;
const BANK_PER_TURN_RATE = 0.16;

// The roll for a turn rate (radians a second, clockwise positive): the inside wing dips.
export function getBank(turnRate: number) {
  return -Math.max(-BANK_MAX, Math.min(BANK_MAX, turnRate * BANK_PER_TURN_RATE));
}
