// The ship is a wheel of twelve boxy modules round a hub. In its own units.
export const MODULE_COUNT = 12;
export const RING_RADIUS = 6;

const FULL_TURN = Math.PI * 2;
// Modules come in two sizes, taking turns round the wheel: across the rim, along it, and deep.
const MODULE_SIZES = [
  [1.7, 2.5, 1.9],
  [1.4, 2.1, 1.5],
] as const;

export type RingModule = {
  id: number;
  // Where it sits on the wheel, and how far it is turned to face along the rim.
  x: number;
  y: number;
  turn: number;
  size: readonly [number, number, number];
};

// The wheel's modules, evenly spaced, each turned to follow the rim.
export function getRingModules(): RingModule[] {
  return Array.from({ length: MODULE_COUNT }, (_, id) => {
    const turn = (id / MODULE_COUNT) * FULL_TURN;

    return {
      id,
      x: Math.cos(turn) * RING_RADIUS,
      y: Math.sin(turn) * RING_RADIUS,
      turn,
      size: MODULE_SIZES[id % MODULE_SIZES.length] ?? MODULE_SIZES[0],
    };
  });
}
