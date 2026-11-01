import type { PaletteColor } from "#/utils/palette";
import type { Planet } from "#/utils/planets";

import type { Point, Shade } from "../types";

type SurfaceStyle = {
  id: string;
  color: PaletteColor;
  shade: Shade;
  opacity: number;
  // Features (land, storms) slide across the disc as the planet turns; bands stay still.
  shouldSpin: boolean;
};

// Flat shapes drawn on a planet's disc, in system units from its center (`y` grows downward).
export type SurfaceShape =
  | (SurfaceStyle & { kind: "ellipse"; x: number; y: number; rx: number; ry: number })
  | (SurfaceStyle & { kind: "polygon"; points: Point[] });

// In planet radii.
const CONTINENTS = [
  { x: -0.35, y: -0.3, rx: 0.38, ry: 0.26 },
  { x: 0.3, y: 0.25, rx: 0.3, ry: 0.4 },
  { x: 0.45, y: -0.45, rx: 0.16, ry: 0.12 },
] as const;
const JUPITER_BANDS = [
  [-0.62, -0.46],
  [-0.2, -0.06],
  [0.14, 0.3],
  [0.5, 0.64],
] as const;
const RED_SPOT = { x: 0.3, y: 0.22, rx: 0.2, ry: 0.12 } as const;
const NEPTUNE_BANDS = [
  [-0.45, -0.2],
  [0.15, 0.5],
] as const;
const BAND_ARC_STEPS = 8;

type GetBandOutlineParams = { radius: number; top: number; bottom: number };

// The part of a disc between two horizontal lines, as a polygon that follows the disc's edge.
export function getBandOutline({ radius, top, bottom }: GetBandOutlineParams): Point[] {
  const edge = (y: number) => Math.sqrt(Math.max(0, radius ** 2 - y ** 2));
  const ys = Array.from(
    { length: BAND_ARC_STEPS + 1 },
    (_, step) => top + ((bottom - top) * step) / BAND_ARC_STEPS,
  );

  return [
    ...ys.map((y) => ({ x: edge(y), y })),
    ...[...ys].reverse().map((y) => ({ x: -edge(y), y })),
  ];
}

type GetBandsParams = {
  planet: Planet;
  bands: readonly (readonly [number, number])[];
  style: Omit<SurfaceStyle, "id" | "shouldSpin">;
};

function getBands({ planet, bands, style }: GetBandsParams): SurfaceShape[] {
  return bands.map(([top, bottom]) => ({
    ...style,
    id: `band-${top}`,
    shouldSpin: false,
    kind: "polygon",
    points: getBandOutline({
      radius: planet.size,
      top: top * planet.size,
      bottom: bottom * planet.size,
    }),
  }));
}

export function getSurfaceShapes(planet: Planet): SurfaceShape[] {
  const surface = planet.features.surface;
  const size = planet.size;

  switch (surface) {
    case undefined:
      return [];
    case "continents":
      return CONTINENTS.map((continent, index) => ({
        id: `continent-${index}`,
        shouldSpin: true,
        kind: "ellipse",
        color: "sage",
        shade: "soft",
        opacity: 1,
        x: continent.x * size,
        y: continent.y * size,
        rx: continent.rx * size,
        ry: continent.ry * size,
      }));
    case "storms":
      return [
        ...getBands({
          planet,
          bands: JUPITER_BANDS,
          style: { color: "sand", shade: "soft", opacity: 0.55 },
        }),
        {
          id: "red-spot",
          shouldSpin: true,
          kind: "ellipse",
          color: "red",
          shade: "soft",
          opacity: 1,
          x: RED_SPOT.x * size,
          y: RED_SPOT.y * size,
          rx: RED_SPOT.rx * size,
          ry: RED_SPOT.ry * size,
        },
      ];
    case "haze":
      return getBands({
        planet,
        bands: NEPTUNE_BANDS,
        style: { color: "blue", shade: "soft", opacity: 0.45 },
      });
    default: {
      const unknownSurface: never = surface;
      return unknownSurface;
    }
  }
}
