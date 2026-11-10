import type { Point } from "#/components/SolarSystem/types";

import type { SceneState } from "../types";

// The black hole has one place in space, like a planet: this far from the sun (twice as far as
// the stars' shell), in the top right of the home view. The camera looks down on the system, so
// that is below the orbit plane, behind it. A phone's tall screen sees less to the side, so
// there it sits closer to the middle. The cockpit only sees it when the ship faces that way.
const HOLE_DISTANCE = 16000;
const HOLE_DIRECTIONS = {
  phone: [0.109, -0.523, -0.846],
  desktop: [0.427, -0.493, -0.758],
} as const;
// Its shadow's radius out there: about 20 pixels across from home, and smaller as the camera
// pulls back, since it is so much further out than the planets.
export const HOLE_RADIUS = 137;
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

// Where the black hole is, in scene units.
export function getHolePosition(isPhone: boolean): [number, number, number] {
  const [x, y, z] = isPhone ? HOLE_DIRECTIONS.phone : HOLE_DIRECTIONS.desktop;

  return [x * HOLE_DISTANCE, y * HOLE_DISTANCE, z * HOLE_DISTANCE];
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

// On the flight home the stars run at full stretch until this much of it is left, then ease
// off as the system comes back; the system starts to show once this much is left.
const HOMING_WARP_FROM = 0.3;
const HOMING_SYSTEM_FROM = 0.75;

// 0 to 1: how far the solar system has dropped away. On the flight home it grows back ahead of
// the ship, from a point to its full size.
export function getEscape({ jump, homing }: Pick<SceneState, "jump" | "homing">) {
  const away = smooth(jump / ESCAPE_BY);
  const ahead = smooth(homing / HOMING_SYSTEM_FROM);

  return Math.max(away, ahead);
}

// The scene's warp: a launch's, the flight into the hole, or the flight home, whichever is
// furthest along.
export function getSceneWarp({ warp, jump, homing }: Pick<SceneState, "warp" | "jump" | "homing">) {
  return Math.max(warp, smooth(jump / WARP_BY), smooth(homing / HOMING_WARP_FROM));
}
