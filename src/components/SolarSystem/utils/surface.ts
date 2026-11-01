import type { PlanetBody } from "#/utils/planets";

import type { Point, Shade, SurfaceColor } from "../types";

type SurfaceStyle = {
  id: string;
  color: SurfaceColor;
  shade: Shade;
  opacity: number;
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
const MERCURY_CRATERS = [
  { x: -0.4, y: -0.3, rx: 0.24, ry: 0.22 },
  { x: 0.35, y: 0.1, rx: 0.3, ry: 0.27 },
  { x: -0.2, y: 0.5, rx: 0.17, ry: 0.15 },
  { x: 0.25, y: -0.55, rx: 0.13, ry: 0.12 },
] as const;
const VENUS_BANDS = [
  [-0.55, -0.35],
  [-0.1, 0.12],
  [0.38, 0.58],
] as const;
// Long, thin cloud streaks in offset pairs, so they read as swirls drifting the wrong way.
const VENUS_SWIRLS = [
  { x: -0.3, y: -0.2, rx: 0.42, ry: 0.1 },
  { x: -0.05, y: -0.08, rx: 0.3, ry: 0.08 },
  { x: 0.35, y: 0.28, rx: 0.4, ry: 0.11 },
  { x: 0.1, y: 0.4, rx: 0.26, ry: 0.07 },
] as const;
const MARS_DUST = [
  { x: -0.3, y: -0.25, rx: 0.32, ry: 0.2 },
  { x: 0.35, y: 0.35, rx: 0.26, ry: 0.18 },
] as const;
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

type Spot = { x: number; y: number; rx: number; ry: number };

type GetSpotsParams = {
  planet: PlanetBody;
  name: string;
  spots: readonly Spot[];
  style: Omit<SurfaceStyle, "id">;
};

// Round features that turn with the planet, from spots in planet radii.
function getSpots({ planet, name, spots, style }: GetSpotsParams): SurfaceShape[] {
  return spots.map((spot, index) => ({
    ...style,
    id: `${name}-${index}`,
    kind: "ellipse",
    x: spot.x * planet.size,
    y: spot.y * planet.size,
    rx: spot.rx * planet.size,
    ry: spot.ry * planet.size,
  }));
}

type GetBandsParams = {
  planet: PlanetBody;
  bands: readonly (readonly [number, number])[];
  style: Omit<SurfaceStyle, "id">;
};

function getBands({ planet, bands, style }: GetBandsParams): SurfaceShape[] {
  return bands.map(([top, bottom]) => ({
    ...style,
    id: `band-${top}`,
    kind: "polygon",
    points: getBandOutline({
      radius: planet.size,
      top: top * planet.size,
      bottom: bottom * planet.size,
    }),
  }));
}

export function getSurfaceShapes(planet: PlanetBody): SurfaceShape[] {
  const surface = planet.features.surface;
  const size = planet.size;

  switch (surface) {
    case undefined:
      return [];
    case "craters":
      return getSpots({
        planet,
        name: "crater",
        spots: MERCURY_CRATERS,
        style: { color: "shadow", shade: "soft", opacity: 0.3 },
      });
    case "clouds":
      return [
        ...getBands({
          planet,
          bands: VENUS_BANDS,
          style: { color: "ochre", shade: "soft", opacity: 0.4 },
        }),
        ...getSpots({
          planet,
          name: "swirl",
          spots: VENUS_SWIRLS,
          style: { color: "terracotta", shade: "soft", opacity: 0.22 },
        }),
      ];
    case "continents":
      return getSpots({
        planet,
        name: "continent",
        spots: CONTINENTS,
        style: { color: "sage", shade: "soft", opacity: 1 },
      });
    case "dust":
      return getSpots({
        planet,
        name: "dust",
        spots: MARS_DUST,
        style: { color: "red", shade: "soft", opacity: 0.55 },
      });
    case "storms":
      return [
        ...getBands({
          planet,
          bands: JUPITER_BANDS,
          style: { color: "sand", shade: "soft", opacity: 0.55 },
        }),
        {
          id: "red-spot",
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
        style: { color: "blue", shade: "vivid", opacity: 0.35 },
      });
    default: {
      const unknownSurface: never = surface;
      return unknownSurface;
    }
  }
}
