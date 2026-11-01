import { getColorVars } from "#/utils/palette";
import type { Planet } from "#/utils/planets";

// styles.css turns these into the accent and the tinted space.
export function getPlanetStyle(planet: Planet | undefined) {
  if (!planet) return undefined;

  return { ...getColorVars(planet.color), "--tint": `var(--${planet.color}-tint)` };
}
