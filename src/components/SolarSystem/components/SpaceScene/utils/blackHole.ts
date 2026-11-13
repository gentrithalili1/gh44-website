import type { Point } from "#/components/SolarSystem/types";

import type { SceneState } from "../types";

const HOLE_DISTANCE = 20000;
const HOLE_DIRECTION = [0.427, -0.493, -0.758] as const;
export const HOLE_RADIUS = 137;
// It fills the whole view by the end of the flight in: this many times its size.
const HOLE_GROWTH = 170;
const GROWTH_POWER = 3.2;
const ESCAPE_BY = 0.07;
const WARP_BY = 0.06;
const CENTER_BY = 0.14;
const JUMP_VIEW_LIFT = { phone: 0.27, desktop: 0.21 } as const;

function smooth(share: number) {
  const clamped = Math.min(1, Math.max(0, share));

  return clamped * clamped * (3 - 2 * clamped);
}

// Where the black hole is, in scene units.
export function getHolePosition(): [number, number, number] {
  const [x, y, z] = HOLE_DIRECTION;

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

export function getHoleScale(jump: number) {
  return 1 + HOLE_GROWTH * jump ** GROWTH_POWER;
}

// 0 to 1: how far the hole has moved from its place to dead ahead.
export function getJumpCenter(jump: number) {
  return smooth(jump / CENTER_BY);
}

const HOMING_WARP_FROM = 0.3;
const HOMING_SYSTEM_FROM = 0.75;

export function getEscape({ jump, homing }: Pick<SceneState, "jump" | "homing">) {
  const away = smooth(jump / ESCAPE_BY);
  const ahead = smooth(homing / HOMING_SYSTEM_FROM);

  return Math.max(away, ahead);
}

export function getSceneWarp({ warp, jump, homing }: Pick<SceneState, "warp" | "jump" | "homing">) {
  return Math.max(warp, smooth(jump / WARP_BY), smooth(homing / HOMING_WARP_FROM));
}
