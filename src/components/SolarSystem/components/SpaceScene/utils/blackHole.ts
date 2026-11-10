import type { Point } from "#/components/SolarSystem/types";

import type { SceneState } from "../types";

// The black hole is so far away that it never moves in the sky: it keeps its place on screen,
// this far from the camera (just inside the stars' shell), whatever the camera does.
export const HOLE_DISTANCE = 7000;
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

// Where it rests on screen, from the center to the edges (-1 to 1, `y` up): the top right, and
// inside the windshield with the cockpit open.
const REST_ANCHORS = {
  home: { phone: { x: 0.6, y: 0.74 }, desktop: { x: 0.74, y: 0.68 } },
  cockpit: { phone: { x: 0.26, y: 0.5 }, desktop: { x: 0.46, y: 0.5 } },
} as const;

function smooth(share: number) {
  const clamped = Math.min(1, Math.max(0, share));

  return clamped * clamped * (3 - 2 * clamped);
}

type View = { isCockpit: boolean; isPhone: boolean };

export function getRestAnchor({ isCockpit, isPhone }: View): Point {
  return REST_ANCHORS[isCockpit ? "cockpit" : "home"][isPhone ? "phone" : "desktop"];
}

// The share of the screen's height the camera's view is lifted by, flying in.
export function getJumpLift(isPhone: boolean) {
  return isPhone ? JUMP_VIEW_LIFT.phone : JUMP_VIEW_LIFT.desktop;
}

type GetHoleAnchorParams = { rest: Point; jump: number; isPhone: boolean };

// Where the hole is on screen `jump` (0 to 1) of the way in: it leaves its corner for dead
// ahead, where the lifted camera looks.
export function getHoleAnchor({ rest, jump, isPhone }: GetHoleAnchorParams): Point {
  const center = getJumpCenter(jump);
  const ahead = { x: 0, y: getJumpLift(isPhone) * 2 };

  return {
    x: rest.x + (ahead.x - rest.x) * center,
    y: rest.y + (ahead.y - rest.y) * center,
  };
}

// How many times its resting size the hole is drawn, `jump` (0 to 1) of the way in: flying at
// it is drawn as it growing.
export function getHoleScale(jump: number) {
  return 1 + HOLE_GROWTH * jump ** GROWTH_POWER;
}

// 0 to 1: how far the hole has moved from its corner to dead ahead.
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
