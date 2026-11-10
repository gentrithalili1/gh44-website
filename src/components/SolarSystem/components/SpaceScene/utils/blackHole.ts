import type { Point } from "#/components/SolarSystem/types";

import type { SceneState } from "../types";

// The black hole is part of the sky, this far from the camera (just inside the stars' shell):
// it turns with the stars as the camera does.
export const HOLE_DISTANCE = 7000;
// The directions to it (one unit long). Outside the ship it is in the top right of the home
// view, on a phone's tall screen and on desktop. The cockpit looks the other way, so there it
// has a second place: in the windshield as the site opens, crossing as the ship goes round.
const HOLE_DIRECTIONS = {
  home: { phone: [0.109, -0.523, -0.846], desktop: [0.427, -0.493, -0.758] },
  cockpit: [0.021, -0.13, 0.991],
} as const;
// Its shadow's radius out there: about 20 pixels across.
export const HOLE_RADIUS = 60;
// It fills the whole view by the end of the flight in: this many times its size.
const HOLE_GROWTH = 170;
const GROWTH_POWER = 3.2;
// How far into the flight (0 to 1) the solar system has dropped away behind, the stars are
// fully stretched, and the hole sits dead ahead.
const ESCAPE_BY = 0.07;
const WARP_BY = 0.06;
const CENTER_BY = 0.14;
// Flying in, the camera looks this share of the screen's height above its center: the middle of
// the windshield, on a phone and on desktop.
const JUMP_VIEW_LIFT = { phone: 0.27, desktop: 0.21 } as const;

function smooth(share: number) {
  const clamped = Math.min(1, Math.max(0, share));

  return clamped * clamped * (3 - 2 * clamped);
}

type Direction = readonly [number, number, number];

// The direction to it from outside the ship, and from the cockpit.
export function getHoleDirections(isPhone: boolean): { home: Direction; cockpit: Direction } {
  return {
    home: isPhone ? HOLE_DIRECTIONS.home.phone : HOLE_DIRECTIONS.home.desktop,
    cockpit: HOLE_DIRECTIONS.cockpit,
  };
}

// The share of the screen's height the camera's view is lifted by, flying in.
export function getJumpLift(isPhone: boolean) {
  return isPhone ? JUMP_VIEW_LIFT.phone : JUMP_VIEW_LIFT.desktop;
}

// Dead ahead on screen, flying in: where the lifted camera looks.
export function getAheadAnchor(isPhone: boolean): Point {
  return { x: 0, y: getJumpLift(isPhone) * 2 };
}

// How many times its resting size the hole is drawn, `jump` (0 to 1) of the way in: flying at
// it is drawn as it growing.
export function getHoleScale(jump: number) {
  return 1 + HOLE_GROWTH * jump ** GROWTH_POWER;
}

// 0 to 1: how far the hole has moved from its place to dead ahead.
export function getJumpCenter(jump: number) {
  return smooth(jump / CENTER_BY);
}

// 0 to 1: how far the solar system has dropped away behind the ship; 1 is gone.
export function getEscape(jump: number) {
  return smooth(jump / ESCAPE_BY);
}

// The scene's warp: a launch's, or the flight into the hole, whichever is further along.
export function getSceneWarp({ warp, jump }: Pick<SceneState, "warp" | "jump">) {
  return Math.max(warp, smooth(jump / WARP_BY));
}
