import { Shape } from "three";

// The Avalon in its own units, nose toward +x: a long spine of twin rods from a domed engine at
// the tail to a reactor ring at the nose, a hub midway, and three crescent hulls round it,
// swept back from the nose like blades. Each hull turns with the others round the spine.
export const BLADE_COUNT = 3;
// A crescent hull from the side: its tips at `front` and `back` along the spine, held off it
// (`lift` at the front tip, more at the back, so it sweeps out), bowing a further `reach` at its
// widest, `thickness` thick in the middle and narrowing to points.
export const BLADE = {
  front: 10,
  back: -6,
  lift: 2.2,
  sweep: 2.4,
  reach: 4.2,
  thickness: 0.85,
  depth: 0.7,
} as const;
// The lights along each hull: how many, between these shares of its length.
export const BLADE_LIGHTS = { count: 7, from: 0.18, to: 0.82 } as const;

const FULL_TURN = Math.PI * 2;
// Points along each edge of the crescent.
const EDGE_STEPS = 20;

// How far round the spine each hull sits (radians).
export function getBladeTurns() {
  return Array.from({ length: BLADE_COUNT }, (_, index) => (index / BLADE_COUNT) * FULL_TURN);
}

type Point = { x: number; y: number };

// A point on the crescent's outer edge, `share` (0 to 1) of the way from its front tip to its
// back: clear of the spine, sweeping out toward the back and bowing out in the middle.
export function getBladePoint(share: number): Point {
  const x = BLADE.front + (BLADE.back - BLADE.front) * share;
  const bow = Math.sin(Math.PI * share ** 0.85);

  return { x, y: BLADE.lift + BLADE.sweep * share + BLADE.reach * bow };
}

// The crescent's outline, out along its outer edge and back along the inner one.
export function getBladeShape() {
  const outer = Array.from({ length: EDGE_STEPS + 1 }, (_, step) =>
    getBladePoint(step / EDGE_STEPS),
  );
  const inner = outer
    .map((point, step) => {
      const share = step / EDGE_STEPS;
      return { x: point.x, y: point.y - BLADE.thickness * Math.sin(Math.PI * share) };
    })
    .reverse();
  const [first, ...rest] = [...outer, ...inner];
  const shape = new Shape();
  if (!first) return shape;
  shape.moveTo(first.x, first.y);
  for (const point of rest) shape.lineTo(point.x, point.y);

  return shape;
}
