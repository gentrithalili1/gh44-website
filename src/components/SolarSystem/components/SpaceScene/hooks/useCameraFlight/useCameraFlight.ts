import { useGSAP } from "@gsap/react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { type RefObject, useRef } from "react";

import { useExplorer } from "#/hooks/useExplorer";

import type { SceneState } from "../../types";
import { CAMERA_HEIGHT } from "../../utils/sceneMath";
import {
  type CameraFocus,
  type CameraPose,
  getCameraFocus,
  getCameraPose,
  getPlanetPosition,
  getShipCameraPose,
  mixPoses,
} from "./utils/cameraFraming";

gsap.registerPlugin(useGSAP);

// The page's ease, cubic-bezier(0.33, 1, 0.68, 1): GSAP's cubic ease-out.
const FLIGHT_EASE = "power2.out";
const FLIGHT_IN_SECONDS = 1.4;
const FLIGHT_OUT_SECONDS = 1.2;
// To the ship and back is quicker: the cockpit opens out of it within about a second.
const SHIP_FLIGHT_IN_SECONDS = 0.7;
const SHIP_FLIGHT_OUT_SECONDS = 0.9;

type Flight = {
  // What the camera is headed for.
  focus: CameraFocus;
  // What the flight is about (flown to, or left behind); it moves straight on screen.
  anchor: CameraFocus;
  from: CameraPose;
  // 0 at take-off, 1 on arrival; GSAP drives it.
  progress: number;
};

function getFocusKey(focus: CameraFocus) {
  return focus.kind === "planet" ? `planet:${focus.planetId}` : focus.kind;
}

function getFlightSeconds({ from, to }: { from: CameraFocus; to: CameraFocus }) {
  if (to.kind === "ship") return SHIP_FLIGHT_IN_SECONDS;
  if (from.kind === "ship" && to.kind === "home") return SHIP_FLIGHT_OUT_SECONDS;

  return to.kind === "planet" ? FLIGHT_IN_SECONDS : FLIGHT_OUT_SECONDS;
}

// Where a focus is now, in system units; undefined for the whole system.
function getFocusPosition({ focus, sceneState }: { focus: CameraFocus; sceneState: SceneState }) {
  switch (focus.kind) {
    case "home":
      return undefined;
    case "planet":
      return getPlanetPosition({
        planetId: focus.planetId,
        planetAngle: sceneState.planetAngles.get(focus.planetId),
      });
    case "ship":
      return sceneState.shipPose;
    default: {
      const unknownFocus: never = focus;
      return unknownFocus;
    }
  }
}

type UseCameraFlightParams = {
  openPlanetId: string | undefined;
  sceneStateRef: RefObject<SceneState>;
};

// Looks straight down. Opening a planet flies in and frames it beside the panel (or above the
// sheet); the open cockpit flies in close to the ship; closing flies home. The first frame is
// already in place, so a deep link starts framed.
export function useCameraFlight({ openPlanetId, sceneStateRef }: UseCameraFlightParams) {
  const explorer = useExplorer();
  const focus = getCameraFocus({
    openPlanetId,
    isCockpitOpen: explorer.cockpit.status === "open",
    flightPlanetId:
      explorer.flight.status === "flying" ? explorer.flight.destination.name : undefined,
  });
  const focusKey = getFocusKey(focus);
  const flightRef = useRef<Flight>({
    focus,
    anchor: focus,
    from: { x: 0, y: 0, zoom: 1 },
    progress: 1,
  });
  const poseRef = useRef<CameraPose | null>(null);

  // Starts a flight when the focus changes, even while the frame loop is paused; GSAP kills a
  // running flight on unmount.
  useGSAP(
    () => {
      const flight = flightRef.current;
      if (getFocusKey(flight.focus) === focusKey) return;
      const duration = getFlightSeconds({ from: flight.focus, to: focus });
      flight.anchor = focus.kind === "home" ? flight.focus : focus;
      flight.focus = focus;
      flight.from = poseRef.current ?? flight.from;
      flight.progress = 0;
      gsap.to(flight, { progress: 1, duration, ease: FLIGHT_EASE, overwrite: true });
    },
    { dependencies: [focusKey] },
  );

  useFrame(({ camera, size }) => {
    const flight = flightRef.current;
    const sceneState = sceneStateRef.current;
    const target =
      flight.focus.kind === "ship"
        ? getShipCameraPose({ viewport: size, shipPosition: sceneState.shipPose })
        : getCameraPose({
            viewport: size,
            planetId: flight.focus.kind === "planet" ? flight.focus.planetId : undefined,
            planetAngle:
              flight.focus.kind === "planet"
                ? sceneState.planetAngles.get(flight.focus.planetId)
                : undefined,
          });
    const anchor = getFocusPosition({ focus: flight.anchor, sceneState });
    const pose =
      flight.progress < 1 && anchor
        ? mixPoses({ from: flight.from, to: target, anchor, progress: flight.progress })
        : target;
    poseRef.current = pose;
    camera.position.set(pose.x, -pose.y, CAMERA_HEIGHT);
    camera.zoom = pose.zoom;
    camera.updateProjectionMatrix();
  });
}
