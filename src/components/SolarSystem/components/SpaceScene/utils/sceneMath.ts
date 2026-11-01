import { MathUtils } from "three";

import type { PlanetState } from "#/components/SolarSystem/types";

// Below this width (the `md` breakpoint) the screen is a phone and the panel a bottom sheet.
export const PHONE_MAX_WIDTH = 720;
// The camera looks straight down at the system from this height.
export const CAMERA_HEIGHT = 1000;
// A long frame (a background tab coming back) must not jump anything across its orbit.
export const MAX_FRAME_STEP = 0.05;
// How fast fades and color changes settle (higher is faster).
export const FADE_LAMBDA = 6;
// Opacity of everything that steps back while a planet is open.
export const FADED_OPACITY = 0.08;

type ScenePoint = { x: number; y: number; depth?: number };

// System units have `y` growing downward, like the SVG; the scene's `y` grows upward and its
// `z` toward the camera.
export function toScenePosition({ x, y, depth = 0 }: ScenePoint): [number, number, number] {
  return [x, -y, depth];
}

// Closer than this, an easing value snaps to its target and stops changing.
const SETTLED_DISTANCE = 0.001;

type DampParams = { current: number; target: number; delta: number; lambda?: number };

export function damp({ current, target, delta, lambda = FADE_LAMBDA }: DampParams) {
  const next = MathUtils.damp(current, target, lambda, delta);

  return Math.abs(target - next) < SETTLED_DISTANCE ? target : next;
}

// While a planet is open the others drift on at a quarter of their speed.
const FADED_PACE = 0.25;

type GetOrbitPaceParams = { state: PlanetState; isHovered: boolean };

// How much of its orbit speed a planet moves at: a hovered or open planet holds still.
export function getOrbitPace({ state, isHovered }: GetOrbitPaceParams) {
  if (isHovered) return 0;

  switch (state) {
    case "idle":
      return 1;
    case "current":
      return 0;
    case "faded":
      return FADED_PACE;
    default: {
      const unknownState: never = state;
      return unknownState;
    }
  }
}
