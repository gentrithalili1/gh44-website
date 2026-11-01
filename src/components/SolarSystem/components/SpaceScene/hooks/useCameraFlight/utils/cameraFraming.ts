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

import { PHONE_MAX_WIDTH } from "../../../utils/sceneMath";

type Viewport = { width: number; height: number };

// Where the camera looks (system units, `y` down) and how many pixels one unit spans.
export type CameraPose = { x: number; y: number; zoom: number };

// What the camera frames: the whole system, an open planet, or the ship with its cockpit open.
export type CameraFocus =
  | { kind: "home" }
  | { kind: "planet"; planetId: string }
  | { kind: "ship" };

// With the cockpit open, pixels per system unit on any screen: the ship close, and enough of
// its neighbourhood through the windshield that a planet or two is usually in view.
const SHIP_ZOOM = 3;

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
  return { x: 0, y: 0, zoom: getFitZoom(viewport) };
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
    x: planetPosition.x + (viewport.width / 2 - box.x) / zoom,
    y: planetPosition.y + (viewport.height / 2 - box.y) / zoom,
    zoom,
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

// A point of the flight between two poses. Zoom blends on a log scale, so every zoom step feels
// the same; the anchor (the planet flown to or from) moves along a straight line on screen
// instead of drifting.
export function mixPoses({ from, to, anchor, progress }: MixPosesParams): CameraPose {
  const zoom = from.zoom * (to.zoom / from.zoom) ** progress;
  const screenFrom = { x: (anchor.x - from.x) * from.zoom, y: (anchor.y - from.y) * from.zoom };
  const screenTo = { x: (anchor.x - to.x) * to.zoom, y: (anchor.y - to.y) * to.zoom };
  const screen = {
    x: screenFrom.x + (screenTo.x - screenFrom.x) * progress,
    y: screenFrom.y + (screenTo.y - screenFrom.y) * progress,
  };

  return { x: anchor.x - screen.x / zoom, y: anchor.y - screen.y / zoom, zoom };
}

type GetShipCameraPoseParams = { viewport: Viewport; shipPosition: Point };

// Close in on the ship, low on the screen and centered: the cockpit's console covers it, and the
// windshield above looks out on the space around it.
export function getShipCameraPose({ viewport, shipPosition }: GetShipCameraPoseParams): CameraPose {
  return {
    x: shipPosition.x,
    y: shipPosition.y + (viewport.height / 2 - viewport.height * COCKPIT_SHIP_Y) / SHIP_ZOOM,
    zoom: SHIP_ZOOM,
  };
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
