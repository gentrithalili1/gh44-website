import type { RealPlanet } from "#/utils/planets";

export type SurfaceLook = {
  // How far noise pushes the painted features around, in planet radii: ragged coasts, wavy bands.
  warp: number;
  // The noise's scale along each axis. A tall `y` draws streaks along the latitudes, as on gas.
  grain: readonly [number, number, number];
  // How fast the weather changes shape. 0 on rock: land holds still.
  drift: number;
  // Light and dark patches over the whole surface.
  mottle: number;
  // Hills and craters catching the sun.
  relief: number;
  // Faint extra bands along the latitudes.
  bands: number;
  // Cloud cover drifting over the surface.
  clouds: number;
  // The latitude (0 equator, 1 pole) where the ice caps start; 0 for none.
  caps: number;
  // The sun's glint on open water.
  glint: number;
  // City lights on the night side's land.
  nightLights: number;
  // The glow of air around the edge.
  air: number;
};

const SURFACE_LOOKS = {
  mercury: look({ warp: 0.04, grain: [3, 3, 3], mottle: 0.35, relief: 1 }),
  venus: look({
    warp: 0.22,
    grain: [1.5, 5, 1.5],
    drift: 0.03,
    mottle: 0.12,
    bands: 0.1,
    air: 0.9,
  }),
  earth: look({
    warp: 0.1,
    grain: [2.2, 2.2, 2.2],
    mottle: 0.16,
    relief: 0.15,
    clouds: 0.8,
    caps: 0.92,
    glint: 0.7,
    nightLights: 1,
    air: 1,
  }),
  mars: look({
    warp: 0.14,
    grain: [2.5, 2.5, 2.5],
    mottle: 0.28,
    relief: 0.7,
    caps: 0.94,
    air: 0.35,
  }),
  jupiter: look({
    warp: 0.09,
    grain: [1.2, 7, 1.2],
    drift: 0.025,
    mottle: 0.1,
    bands: 0.12,
    air: 0.5,
  }),
  saturn: look({ warp: 0.05, grain: [1, 8, 1], drift: 0.02, mottle: 0.06, bands: 0.16, air: 0.5 }),
  uranus: look({ warp: 0.03, grain: [1, 5, 1], drift: 0.015, mottle: 0.03, bands: 0.06, air: 0.7 }),
  neptune: look({
    warp: 0.1,
    grain: [1.3, 6, 1.3],
    drift: 0.03,
    mottle: 0.08,
    bands: 0.1,
    air: 0.8,
  }),
} as const satisfies Record<RealPlanet, SurfaceLook>;

function look(values: Pick<SurfaceLook, "warp" | "grain"> & Partial<SurfaceLook>): SurfaceLook {
  return {
    drift: 0,
    mottle: 0,
    relief: 0,
    bands: 0,
    clouds: 0,
    caps: 0,
    glint: 0,
    nightLights: 0,
    air: 0,
    ...values,
  };
}

// How a real planet's surface behaves: rock holds still and shows relief, gas streaks and drifts.
export function getSurfaceLook(realPlanet: RealPlanet): SurfaceLook {
  return SURFACE_LOOKS[realPlanet];
}
