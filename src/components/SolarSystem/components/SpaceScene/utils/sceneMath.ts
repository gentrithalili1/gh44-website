import { MathUtils, type PerspectiveCamera, Vector3 } from "three";

import type { PlanetState } from "#/components/SolarSystem/types";

// Below this width (the `md` breakpoint) the screen is a phone and the panel a bottom sheet.
export const PHONE_MAX_WIDTH = 720;
// How fast fades and color changes settle (higher is faster).
export const FADE_LAMBDA = 6;
// A long frame (a background tab coming back) must not jump anything across its orbit, or
// launch a burst of meteors: no frame moves the scene further than this many seconds.
export const MAX_FRAME_STEP = 0.05;
// Opacity of everything that steps back while a planet is open.
export const FADED_OPACITY = 0.08;

type ScenePoint = { x: number; y: number; depth?: number };

// System units have `y` growing downward, like the SVG; the scene's `y` grows upward and its
// `z` toward the camera.
export function toScenePosition({ x, y, depth = 0 }: ScenePoint): [number, number, number] {
  return [x, -y, depth];
}

// A press that moved further than this many pixels was a drag to orbit the camera, not a click.
const DRAG_TOLERANCE_PX = 4;

// Whether a click event (its `delta`: pixels between press and release) ended a drag.
export function isDragRelease(delta: number) {
  return delta > DRAG_TOLERANCE_PX;
}

type PlanePoint = { x: number; y: number; height?: number };

// The system lies on the scene's x/z plane: system `y` (down on the home view) is the scene's
// `z`, toward the viewer; `height` rises off the plane.
export function toPlanePosition({ x, y, height = 0 }: PlanePoint): [number, number, number] {
  return [x, height, y];
}

// The turn around the scene's up axis that points a model's nose (built along -z) along a
// heading: radians clockwise from up on the home view, as the 2D drawings measure them.
export function getPlaneYaw(heading: number) {
  return -heading;
}

const forward = new Vector3();
const toPoint = new Vector3();

type GetPixelsPerUnitParams = {
  camera: PerspectiveCamera;
  viewport: { width: number; height: number };
  position: [number, number, number];
};

// How many screen pixels one scene unit spans at a point, seen through the perspective camera.
export function getPixelsPerUnit({ camera, viewport, position }: GetPixelsPerUnitParams) {
  camera.getWorldDirection(forward);
  const depth = toPoint
    .set(...position)
    .sub(camera.position)
    .dot(forward);

  return viewport.height / (2 * depth * Math.tan(MathUtils.degToRad(camera.fov / 2)));
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
