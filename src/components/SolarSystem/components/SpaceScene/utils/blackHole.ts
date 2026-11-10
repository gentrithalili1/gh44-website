import type { SceneState } from "../types";

// The black hole sits far out, just inside the stars' shell, in the top right of the home view:
// the camera looks down on the system, so that is below the orbit plane, behind it. Scene units.
export const HOLE_POSITION: [number, number, number] = [2580, -3816, -5537];
// Its shadow's radius out there: about 16 pixels across from home.
export const HOLE_RADIUS = 46;
// It fills the whole view by the end of the flight in: this many times its size.
const HOLE_GROWTH = 170;
const GROWTH_POWER = 3.2;
// The stars are fully stretched, and the ship has turned to face it, this far into the flight.
const WARP_BY = 0.22;
const TURN_BY = 0.3;

function smooth(share: number) {
  const clamped = Math.min(1, Math.max(0, share));

  return clamped * clamped * (3 - 2 * clamped);
}

// How many times its resting size the hole is drawn, `jump` (0 to 1) of the way in: flying at
// it is drawn as it growing.
export function getHoleScale(jump: number) {
  return 1 + HOLE_GROWTH * jump ** GROWTH_POWER;
}

// 0 to 1: how far the camera has turned from the ship's view to face the hole.
export function getJumpTurn(jump: number) {
  return smooth(jump / TURN_BY);
}

// The scene's warp: a launch's, or the flight into the hole, whichever is further along.
export function getSceneWarp({ warp, jump }: Pick<SceneState, "warp" | "jump">) {
  return Math.max(warp, smooth(jump / WARP_BY));
}
