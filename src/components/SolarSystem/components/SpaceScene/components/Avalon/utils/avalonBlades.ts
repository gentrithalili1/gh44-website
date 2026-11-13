import { Shape } from "three";

export const BLADE_COUNT = 3;
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
