import { Shape, Vector2 } from "three";

import type { Point } from "#/components/SolarSystem/types";
import { getTiltedPoint, ORBIT_TILT, ROCKET_OUTLINE } from "#/components/SolarSystem/utils/space";
import type { SurfaceShape } from "#/components/SolarSystem/utils/surface";

import { toScenePosition } from "../../../utils/sceneMath";

const ORBIT_SEGMENTS = 128;

// Tilts a flat ring so its near half (below the planet) comes toward the camera, matching
// `getTiltedPoint`.
export const TILTED_PLANE_ROTATION = -Math.acos(ORBIT_TILT);

function createShape(points: readonly Point[]) {
  return new Shape(
    points.map((point) => {
      const [x, y] = toScenePosition(point);
      return new Vector2(x, y);
    }),
  );
}

// Outlines are plain data; the meshes build (and R3F frees) their geometry from them.
export function createSurfaceOutline(shape: SurfaceShape) {
  switch (shape.kind) {
    case "ellipse": {
      const [x, y] = toScenePosition(shape);
      return new Shape().absellipse(x, y, shape.rx, shape.ry, 0, Math.PI * 2, false, 0);
    }
    case "polygon":
      return createShape(shape.points);
    default: {
      const unknownShape: never = shape;
      return unknownShape;
    }
  }
}

// A moon or satellite orbit: a circle on the tilted plane, so its far half hides behind the planet.
export function getTiltedOrbitPositions(radius: number) {
  return new Float32Array(
    Array.from({ length: ORBIT_SEGMENTS }, (_, index) => {
      const angle = (index / ORBIT_SEGMENTS) * Math.PI * 2;
      return toScenePosition(getTiltedPoint({ radius, angle }));
    }).flat(),
  );
}

export function createRocketOutline() {
  return createShape(ROCKET_OUTLINE);
}
