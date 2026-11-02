import type { PaletteColor } from "#/utils/palette";

// How a planet shows while one is open: the open one is current, the rest fade.
export type PlanetState = "idle" | "current" | "faded";

// A palette color's soft or vivid shade.
export type Shade = "soft" | "vivid";

// A point in system units: `x` right, `y` down.
export type Point = { x: number; y: number };

// What a surface feature or a moon's crater is painted with: a palette color, or the page's
// background (`shadow`), laid thin over the body to darken it.
export type SurfaceColor = PaletteColor | "shadow";
