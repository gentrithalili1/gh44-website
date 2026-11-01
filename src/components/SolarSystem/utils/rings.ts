import type { PaletteColor } from "#/utils/palette";
import type { PlanetBody } from "#/utils/planets";
import { THEME_TOOLS, type ThemeToolId } from "#/utils/themeTools";

import { messages } from "../messages";

// Each band is an app gh44-theme covers.
export type RingBand = {
  id: ThemeToolId;
  label: string;
  color: PaletteColor;
  innerRadius: number;
  outerRadius: number;
};

// In planet radii: where the rings start, each band's width and the gap between bands.
const RING_START = 1.3;
const BAND_WIDTH = 0.1;
const BAND_GAP = 0.025;

// Saturn's rings: one band per app gh44-theme covers, inner to outer, in the app's color.
export function getRingBands(planet: PlanetBody): RingBand[] {
  const rings = planet.features.rings;

  switch (rings) {
    case undefined:
    case "upright":
      return [];
    case "apps":
      return THEME_TOOLS.map((tool, index) => {
        const innerRadius = planet.size * (RING_START + index * (BAND_WIDTH + BAND_GAP));

        return {
          id: tool.id,
          label: messages.appRing(tool.name),
          color: tool.color,
          innerRadius,
          outerRadius: innerRadius + planet.size * BAND_WIDTH,
        };
      });
    default: {
      const unknownRings: never = rings;
      return unknownRings;
    }
  }
}

// Uranus' ring, in planet radii: a thin band seen almost edge on, so it shows as a tall, narrow
// ellipse, leaning slightly off vertical.
const UPRIGHT_RING_START = 1.5;
const UPRIGHT_RING_WIDTH = 0.12;
const UPRIGHT_RING_SQUASH = 0.32;
const UPRIGHT_RING_LEAN = 0.26;

// A thin ring standing almost upright: a circle of these radii squashed to `squash` of its width,
// then turned `lean` radians off vertical.
export type UprightRing = {
  color: PaletteColor;
  innerRadius: number;
  outerRadius: number;
  squash: number;
  lean: number;
};

export function getUprightRing(planet: PlanetBody): UprightRing | undefined {
  if (planet.features.rings !== "upright") return undefined;
  const innerRadius = planet.size * UPRIGHT_RING_START;

  return {
    color: "neutral",
    innerRadius,
    outerRadius: innerRadius + planet.size * UPRIGHT_RING_WIDTH,
    squash: UPRIGHT_RING_SQUASH,
    lean: UPRIGHT_RING_LEAN,
  };
}
