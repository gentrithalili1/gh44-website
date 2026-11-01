import { getColorVars, PALETTE, SPACE_COLORS } from "#/utils/palette";

import type { Shade, SurfaceColor } from "../types";

type GetSurfaceHexParams = { color: SurfaceColor; shade: Shade };

// The hex three.js paints a surface color with.
export function getSurfaceHex({ color, shade }: GetSurfaceHexParams) {
  return color === "shadow" ? SPACE_COLORS.background : PALETTE[color][shade];
}

// The CSS variables the static drawing paints a surface color with (`--hue`, `--vivid`).
export function getSurfaceColorVars(color: SurfaceColor) {
  if (color === "shadow") return { "--hue": "var(--background)", "--vivid": "var(--background)" };

  return getColorVars(color);
}
