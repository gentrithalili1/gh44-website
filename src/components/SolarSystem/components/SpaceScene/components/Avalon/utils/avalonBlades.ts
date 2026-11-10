// The ship has three long curved hulls set evenly round its spine. In its own units.
export const BLADE_COUNT = 3;
// Each hull is an arc of a circle this wide, standing this far off the spine.
export const BLADE = { radius: 7.5, arc: 2.3, offset: 3.4 } as const;

const FULL_TURN = Math.PI * 2;

// How far round the spine each hull sits (radians).
export function getBladeTurns() {
  return Array.from({ length: BLADE_COUNT }, (_, index) => (index / BLADE_COUNT) * FULL_TURN);
}
