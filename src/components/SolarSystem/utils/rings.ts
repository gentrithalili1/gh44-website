import type { PaletteColor } from "#/utils/palette";
import type { Planet } from "#/utils/planets";
import { THEME_TOOLS } from "#/utils/themeTools";

import { messages } from "../messages";

export type RingBand = {
  id: string;
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
export function getRingBands(planet: Planet): RingBand[] {
  const rings = planet.features.rings;

  switch (rings) {
    case undefined:
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
