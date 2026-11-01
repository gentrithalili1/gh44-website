import type { Shade, SurfaceColor } from "#/components/SolarSystem/types";
import { getSurfaceShapes, type SurfaceShape } from "#/components/SolarSystem/utils/surface";
import type { PlanetBody } from "#/utils/planets";

type PaintStyle = { color: SurfaceColor; shade: Shade; opacity: number };

// What to paint on a planet's map, in its share (0 to 1) of the map's width (`u`, west to east)
// and height (`v`, north to south): a band all the way round, or a round feature.
export type SurfacePaint =
  | (PaintStyle & { kind: "stripe"; top: number; bottom: number })
  | (PaintStyle & { kind: "spot"; u: number; v: number; radiusU: number; radiusV: number });

// The globe's front, toward the home camera, sits a quarter of the way along its map.
const FRONT_U = 0.25;
// The 2D surface wrapped around, so a feature came back as it left: the far side carries a copy.
const FAR_SIDE_U = 0.5;

// From a height on the disc (planet radii, `y` down) to the map's `v`.
function getMapV(y: number) {
  return 0.5 - Math.asin(Math.max(-1, Math.min(1, -y))) / Math.PI;
}

function getStyle({ color, shade, opacity }: SurfaceShape): PaintStyle {
  return { color, shade, opacity };
}

// One surface shape, drawn flat on the disc, painted where it lies on the globe: bands keep their
// latitudes, features their spot on the side facing the camera.
function getShapePaint({ shape, radius }: { shape: SurfaceShape; radius: number }): SurfacePaint[] {
  switch (shape.kind) {
    case "polygon": {
      const ys = shape.points.map((point) => point.y / radius);
      return [
        {
          ...getStyle(shape),
          kind: "stripe",
          top: getMapV(Math.min(...ys)),
          bottom: getMapV(Math.max(...ys)),
        },
      ];
    }
    case "ellipse": {
      const latitude = Math.asin(-shape.y / radius);
      const ringRadius = Math.cos(latitude) * radius;
      const longitude = Math.asin(Math.max(-1, Math.min(1, shape.x / ringRadius)));
      const spot = {
        ...getStyle(shape),
        kind: "spot",
        u: FRONT_U + longitude / (2 * Math.PI),
        v: getMapV(shape.y / radius),
        radiusU: shape.rx / ringRadius / (2 * Math.PI),
        radiusV: shape.ry / radius / Math.PI,
      } as const;
      return [spot, { ...spot, u: spot.u + FAR_SIDE_U }];
    }
    default: {
      const unknownShape: never = shape;
      return unknownShape;
    }
  }
}

// A planet's surface as a map wrapped around its globe.
export function getSurfacePaint(planet: PlanetBody): SurfacePaint[] {
  return getSurfaceShapes(planet).flatMap((shape) => getShapePaint({ shape, radius: planet.size }));
}
