import type { Point } from "#/components/SolarSystem/types";
import { getOrbiters } from "#/components/SolarSystem/utils/orbiters";
import { getRingBands, getUprightRing } from "#/components/SolarSystem/utils/rings";
import {
  getOrbitPosition,
  ROCKET_GAP,
  ROCKET_LENGTH,
  SYSTEM_SIZE,
} from "#/components/SolarSystem/utils/space";
import { COCKPIT_SHIP_Y } from "#/utils/explorer";
import { PANEL_WIDTH, SHEET_HEIGHT } from "#/utils/panel";
import { findPlanet, type PlanetBody, PLANETS } from "#/utils/planets";

import { PHONE_MAX_WIDTH, toPlanePosition } from "../../../utils/sceneMath";

type Viewport = { width: number; height: number };

// Where the camera looks (system units, `y` down), how many pixels one unit spans there, and
// where that point sits on screen (pixels from the center, `y` down).
export type CameraPose = { x: number; y: number; zoom: number; offset: Point };

// Which way the camera looks at its point: `polar` radians off straight down, `azimuth` radians
// around it (0 looks from the bottom of the screen).
export type CameraAngle = { polar: number; azimuth: number };

// The camera's vertical field of view, in degrees.
export const CAMERA_FOV = 45;
// Home looks down on the system at about 41 degrees off vertical, like the prototype.
export const HOME_ANGLE: CameraAngle = { polar: 0.72, azimuth: 0 };
const NO_OFFSET: Point = { x: 0, y: 0 };

// What the camera frames: the whole system, an open planet, or the ship with its cockpit open.
export type CameraFocus =
  | { kind: "home" }
  | { kind: "planet"; planetId: string }
  | { kind: "ship" };

// With the cockpit open, pixels per system unit on any screen, and how far off straight down the
// camera looks: from just behind the ship, in toward the sun, so a planet or two is usually in
// view through the windshield.
const SHIP_ZOOM = 3;
const SHIP_POLAR = 1.05;

// The share of a phone's height the bottom sheet leaves free.
const PHONE_FREE_HEIGHT = 1 - SHEET_HEIGHT;
// On desktop the planet's box is the left 45% of the screen, centered 30% from the left.
const DESKTOP_FREE_WIDTH = 0.45;
const DESKTOP_CENTER_X = 0.3;
// The planet's reach fills this share of the free box, and zooms in at most this many times.
const REACH_FILL = 0.42;
const MAX_ZOOM = 9;

function getFitZoom({ width, height }: Viewport) {
  return Math.min(width, height) / SYSTEM_SIZE;
}

export function getHomePose(viewport: Viewport): CameraPose {
  return { x: 0, y: 0, zoom: getFitZoom(viewport), offset: NO_OFFSET };
}

// The free box the panel leaves: its center on screen and its size, in pixels.
function getFreeBox({ width, height }: Viewport) {
  if (width < PHONE_MAX_WIDTH) {
    return {
      x: width / 2,
      y: (height * PHONE_FREE_HEIGHT) / 2,
      size: Math.min(width, height * PHONE_FREE_HEIGHT),
    };
  }
  const freeWidth = Math.max(width - PANEL_WIDTH, 0);
  const boxWidth = Math.min(width * DESKTOP_FREE_WIDTH, freeWidth);

  return {
    x: Math.min(width * DESKTOP_CENTER_X, freeWidth / 2),
    y: height / 2,
    size: Math.min(boxWidth, height),
  };
}

type GetPlanetPoseParams = { viewport: Viewport; planetPosition: Point; reach: number };

// Frames an open planet in the space the panel leaves free, sized by its reach.
export function getPlanetPose({
  viewport,
  planetPosition,
  reach,
}: GetPlanetPoseParams): CameraPose {
  const box = getFreeBox(viewport);
  const zoom = Math.min(MAX_ZOOM * getFitZoom(viewport), (box.size * REACH_FILL) / reach);

  return {
    ...planetPosition,
    zoom,
    offset: { x: box.x - viewport.width / 2, y: box.y - viewport.height / 2 },
  };
}

// How far from its center a planet's moons, satellites, rings or rocket go.
export function getPlanetReach(planet: PlanetBody) {
  const orbiterReaches = getOrbiters(planet).map((orbiter) => orbiter.orbitRadius + orbiter.radius);
  const ringReaches = getRingBands(planet).map((band) => band.outerRadius);
  const uprightRingReach = getUprightRing(planet)?.outerRadius ?? 0;
  const rocketReach = planet.features.hasRocket ? planet.size + ROCKET_GAP + ROCKET_LENGTH : 0;

  return Math.max(planet.size, rocketReach, uprightRingReach, ...orbiterReaches, ...ringReaches);
}

const PLANET_REACHES = new Map(PLANETS.map((planet) => [planet.id, getPlanetReach(planet)]));

type GetPlanetPositionParams = {
  planetId: string | undefined;
  // The planet's current angle on its orbit, when the scene knows it.
  planetAngle: number | undefined;
};

// Where a planet is now, in system units; undefined for no planet.
export function getPlanetPosition({ planetId, planetAngle }: GetPlanetPositionParams) {
  const planet = findPlanet(planetId);
  if (!planet) return undefined;

  return getOrbitPosition({
    radius: planet.orbit.radius,
    phase: planetAngle ?? planet.orbit.phase,
  });
}

type GetCameraPoseParams = GetPlanetPositionParams & { viewport: Viewport };

export function getCameraPose({ viewport, planetId, planetAngle }: GetCameraPoseParams) {
  const planet = findPlanet(planetId);
  const planetPosition = getPlanetPosition({ planetId, planetAngle });
  if (!planet || !planetPosition) return getHomePose(viewport);

  return getPlanetPose({
    viewport,
    planetPosition,
    reach: PLANET_REACHES.get(planet.id) ?? getPlanetReach(planet),
  });
}

type MixPosesParams = { from: CameraPose; to: CameraPose; anchor: Point; progress: number };

function mix({ from, to, progress }: { from: number; to: number; progress: number }) {
  return from + (to - from) * progress;
}

// A point of the flight between two poses. Zoom blends on a log scale, so every zoom step feels
// the same; the anchor (the planet flown to or from) moves along a straight line on screen
// instead of drifting.
export function mixPoses({ from, to, anchor, progress }: MixPosesParams): CameraPose {
  const zoom = from.zoom * (to.zoom / from.zoom) ** progress;
  const offset = {
    x: mix({ from: from.offset.x, to: to.offset.x, progress }),
    y: mix({ from: from.offset.y, to: to.offset.y, progress }),
  };
  // Where the anchor sits on screen, from the center.
  const screenFrom = {
    x: (anchor.x - from.x) * from.zoom + from.offset.x,
    y: (anchor.y - from.y) * from.zoom + from.offset.y,
  };
  const screenTo = {
    x: (anchor.x - to.x) * to.zoom + to.offset.x,
    y: (anchor.y - to.y) * to.zoom + to.offset.y,
  };
  const screen = {
    x: mix({ from: screenFrom.x, to: screenTo.x, progress }),
    y: mix({ from: screenFrom.y, to: screenTo.y, progress }),
  };

  return {
    x: anchor.x - (screen.x - offset.x) / zoom,
    y: anchor.y - (screen.y - offset.y) / zoom,
    zoom,
    offset,
  };
}

const FULL_TURN = Math.PI * 2;

type MixAnglesParams = { from: CameraAngle; to: CameraAngle; progress: number };

// Turns the camera between two angles, around the short way.
export function mixAngles({ from, to, progress }: MixAnglesParams): CameraAngle {
  const turn =
    ((((to.azimuth - from.azimuth + Math.PI) % FULL_TURN) + FULL_TURN) % FULL_TURN) - Math.PI;

  return {
    polar: mix({ from: from.polar, to: to.polar, progress }),
    azimuth: from.azimuth + turn * progress,
  };
}

// How far from its point the camera sits for one unit there to span `zoom` pixels.
export function getCameraDistance({ viewport, zoom }: { viewport: Viewport; zoom: number }) {
  return viewport.height / (2 * Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180) * zoom);
}

// The visitor zooms out at most this many times past home, and in this many times past the
// closest a planet is framed.
const ZOOM_OUT_LIMIT = 1.5;
const ZOOM_IN_LIMIT = 1.5;

// How close to and far from its point the visitor may move the camera.
export function getDistanceLimits(viewport: Viewport) {
  const fitZoom = getFitZoom(viewport);

  return {
    min: getCameraDistance({ viewport, zoom: fitZoom * MAX_ZOOM * ZOOM_IN_LIMIT }),
    max: getCameraDistance({ viewport, zoom: fitZoom / ZOOM_OUT_LIMIT }),
  };
}

type Offset = { x: number; y: number; z: number };

// The angle a camera looks from, given where it sits relative to its point: the inverse of
// `getCameraPlacement`.
export function getCameraAngle(offset: Offset): CameraAngle {
  return {
    polar: Math.acos(offset.y / Math.hypot(offset.x, offset.y, offset.z)),
    azimuth: Math.atan2(offset.x, offset.z),
  };
}

type GetCameraPlacementParams = { pose: CameraPose; angle: CameraAngle; viewport: Viewport };

// Where the perspective camera goes for a pose seen from an angle, and the view offset that
// moves its point to the pose's spot on screen.
export function getCameraPlacement({ pose, angle, viewport }: GetCameraPlacementParams) {
  const distance = getCameraDistance({ viewport, zoom: pose.zoom });
  const target = toPlanePosition(pose);
  const [x, , z] = target;
  const across = Math.sin(angle.polar) * distance;

  return {
    target,
    position: [
      x + Math.sin(angle.azimuth) * across,
      Math.cos(angle.polar) * distance,
      z + Math.cos(angle.azimuth) * across,
    ] satisfies [number, number, number],
    viewOffset: { x: -pose.offset.x, y: -pose.offset.y },
  };
}

type GetShipCameraPoseParams = { viewport: Viewport; shipPosition: Point };

// Close in on the ship, low on the screen and centered: the cockpit's console covers it, and the
// windshield above looks out on the space around it.
export function getShipCameraPose({ viewport, shipPosition }: GetShipCameraPoseParams): CameraPose {
  return {
    x: shipPosition.x,
    y: shipPosition.y,
    zoom: SHIP_ZOOM,
    offset: { x: 0, y: viewport.height * COCKPIT_SHIP_Y - viewport.height / 2 },
  };
}

// The angle the cockpit looks from: behind the ship, in toward the sun across the system.
export function getShipCameraAngle(shipPosition: Point): CameraAngle {
  return { polar: SHIP_POLAR, azimuth: Math.atan2(shipPosition.x, shipPosition.y) };
}

type GetCameraFocusParams = {
  openPlanetId: string | undefined;
  isCockpitOpen: boolean;
  // Where a launched ship is headed, from `go` until the page opens.
  flightPlanetId: string | undefined;
};

// The open cockpit holds the camera on the ship. Once it closes on a launch, the camera heads for
// the destination ahead of the page, whose own flight then carries on.
export function getCameraFocus({
  openPlanetId,
  isCockpitOpen,
  flightPlanetId,
}: GetCameraFocusParams): CameraFocus {
  if (isCockpitOpen) return { kind: "ship" };
  const planetId = flightPlanetId ?? openPlanetId;

  return planetId === undefined ? { kind: "home" } : { kind: "planet", planetId };
}
