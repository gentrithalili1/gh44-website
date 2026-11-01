import type { Point } from "#/components/SolarSystem/types";

// The ship fades into the planet over the last part of its trip.
const FADE_FROM_TRAVEL = 0.65;
const FULL_TURN = Math.PI * 2;

type GetFlightPoseParams = {
  home: Point;
  homeHeading: number;
  target: Point;
  // How far from the target's center the ship stops: the planet's radius.
  stopDistance: number;
  // 0 to 1: how far it has turned toward the target, and how far it has flown.
  turn: number;
  travel: number;
};

// The ship on its way from home to a planet: it turns its nose toward the planet (the short way
// round), flies straight at it and fades as it arrives. Headings are clockwise from nose up.
export function getFlightPose({
  home,
  homeHeading,
  target,
  stopDistance,
  turn,
  travel,
}: GetFlightPoseParams) {
  const dx = target.x - home.x;
  const dy = target.y - home.y;
  const distance = Math.hypot(dx, dy);
  const reach = distance > 0 ? Math.max(0, distance - stopDistance) / distance : 0;
  const towardTarget = Math.atan2(dx, -dy);
  const shortTurn =
    ((((towardTarget - homeHeading + Math.PI) % FULL_TURN) + FULL_TURN) % FULL_TURN) - Math.PI;

  return {
    x: home.x + dx * reach * travel,
    y: home.y + dy * reach * travel,
    heading: homeHeading + shortTurn * turn,
    fade: travel <= FADE_FROM_TRAVEL ? 1 : 1 - (travel - FADE_FROM_TRAVEL) / (1 - FADE_FROM_TRAVEL),
  };
}
