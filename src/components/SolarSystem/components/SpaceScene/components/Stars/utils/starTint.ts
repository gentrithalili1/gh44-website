import { Color, LinearSRGBColorSpace } from "three";

import { PALETTE, SPACE_COLORS } from "#/utils/palette";
import { findPlanet } from "#/utils/planets";

import { FADE_LAMBDA } from "../../../utils/sceneMath";

// Closer than this per channel, the tint snaps to its target.
const SETTLED_DISTANCE = 0.001;

// The stars take the open planet's color, and the foreground's at home. The channels stay
// sRGB as written (no conversion to linear), because the star shaders output them as they are.
export function getStarTint(openPlanetId: string | undefined) {
  const planet = findPlanet(openPlanetId);

  return new Color().setStyle(
    planet ? PALETTE[planet.color].soft : SPACE_COLORS.foreground,
    LinearSRGBColorSpace,
  );
}

type StepStarTintParams = { tint: Color; target: Color; delta: number };

// Eases the tint one frame toward its target, in place.
export function stepStarTint({ tint, target, delta }: StepStarTintParams) {
  if (tint.equals(target)) return;
  tint.lerp(target, 1 - Math.exp(-FADE_LAMBDA * delta));
  const distance = Math.max(
    Math.abs(tint.r - target.r),
    Math.abs(tint.g - target.g),
    Math.abs(tint.b - target.b),
  );
  if (distance < SETTLED_DISTANCE) tint.copy(target);
}
