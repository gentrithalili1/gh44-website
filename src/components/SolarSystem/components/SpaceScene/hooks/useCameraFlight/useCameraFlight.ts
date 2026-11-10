import { useGSAP } from "@gsap/react";
import type { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { type ComponentRef, type RefObject, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";

import { useExplorer } from "#/hooks/useExplorer";

import type { SceneState } from "../../types";
import { getJumpCenter, getJumpLift, getSceneWarp } from "../../utils/blackHole";
import { PHONE_MAX_WIDTH } from "../../utils/sceneMath";
import {
  type CameraAngle,
  type CameraFocus,
  type CameraPose,
  getCameraAngle,
  getCameraDistance,
  getCameraFocus,
  getCameraPlacement,
  CAMERA_FOV,
  getCameraPose,
  getDistanceLimits,
  getPlanetPosition,
  getShipCameraAngle,
  getShipCameraPose,
  HOME_ANGLE,
  mixAngles,
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
// Flights curve: the camera swings this far round its point at mid-flight (radians), one way
// going in and back the other way going out.
const PLANET_SWING = 0.32;
const SHIP_SWING = 0.2;
// The view widens a little at a flight's fastest (degrees), and a lot through a launch's jump.
const FLIGHT_FOV_PUSH = 4;
const WARP_FOV_PUSH = 16;
type Flight = {
  // What the camera is headed for.
  focus: CameraFocus;
  // What the flight is about (flown to, or left behind); it moves straight on screen.
  anchor: CameraFocus;
  from: CameraPose;
  // The camera's angle at take-off; it turns from there to the focus' own angle.
  fromAngle: CameraAngle;
  // How far round the camera swings at mid-flight.
  swing: number;
  // 0 at take-off, 1 on arrival; GSAP drives it.
  progress: number;
};

function getFlightSwing({ from, to }: { from: CameraFocus; to: CameraFocus }) {
  if (to.kind === "ship") return SHIP_SWING;
  if (to.kind === "planet") return PLANET_SWING;

  return from.kind === "ship" ? -SHIP_SWING : -PLANET_SWING;
}

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

// The angle the camera turns to for a focus: a planet keeps the one the visitor had at take-off,
// home turns back to the home angle, and the cockpit looks from behind the ship toward the sun.
function getFocusAngle({ flight, sceneState }: { flight: Flight; sceneState: SceneState }) {
  switch (flight.focus.kind) {
    case "home":
      return HOME_ANGLE;
    case "planet":
      return flight.fromAngle;
    case "ship":
      return getShipCameraAngle(sceneState.shipPose);
    default: {
      const unknownFocus: never = flight.focus;
      return unknownFocus;
    }
  }
}

// Where the camera is looking from, relative to its point.
const fromPoint = new Vector3();

type UseCameraFlightParams = {
  openPlanetId: string | undefined;
  sceneStateRef: RefObject<SceneState>;
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>;
};

// Looks down on the system at an angle. Opening a planet flies in and frames it beside the panel
// (or above the sheet), then follows it; the open cockpit flies in behind the ship, looking in
// toward the sun, and follows it; closing flies home and turns back to the home angle. Between flights the visitor orbits
// and zooms around what the camera follows. The first frame is already in place, so a deep link
// starts framed.
export function useCameraFlight({
  openPlanetId,
  sceneStateRef,
  controlsRef,
}: UseCameraFlightParams) {
  const explorer = useExplorer();
  const size = useThree((state) => state.size);
  const focus = getCameraFocus({
    openPlanetId,
    isCockpitOpen: explorer.cockpit.status === "open",
    flightPlanetId:
      explorer.flight.status === "flying" ? explorer.flight.destination.name : undefined,
  });
  const focusKey = getFocusKey(focus);
  const isLaunching = explorer.flight.status === "flying";
  const flightRef = useRef<Flight>({
    focus,
    anchor: focus,
    from: { x: 0, y: 0, zoom: 1, offset: { x: 0, y: 0 } },
    fromAngle: HOME_ANGLE,
    swing: 0,
    progress: 1,
  });
  // The pose and angle drawn last frame, and how far the visitor has zoomed from the framing.
  const poseRef = useRef<CameraPose | null>(null);
  const angleRef = useRef<CameraAngle>(HOME_ANGLE);
  const zoomScaleRef = useRef(1);

  // Starts a flight when the focus changes, even while the frame loop is paused; GSAP kills a
  // running flight on unmount.
  useGSAP(
    () => {
      const flight = flightRef.current;
      if (getFocusKey(flight.focus) === focusKey) return;
      const duration = getFlightSeconds({ from: flight.focus, to: focus });
      flight.anchor = focus.kind === "home" ? flight.focus : focus;
      flight.swing = getFlightSwing({ from: flight.focus, to: focus });
      flight.focus = focus;
      flight.from = poseRef.current ?? flight.from;
      flight.fromAngle = angleRef.current;
      zoomScaleRef.current = 1;
      flight.progress = 0;
      gsap.to(flight, { progress: 1, duration, ease: FLIGHT_EASE, overwrite: true });
    },
    { dependencies: [focusKey] },
  );

  useFrame(({ camera, size }) => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const controls = controlsRef.current;
    const flight = flightRef.current;
    const sceneState = sceneStateRef.current;
    const isFlying = flight.progress < 1;
    const lastPose = poseRef.current;
    // Settled, the controls ran first this frame: take on the visitor's orbit and zoom.
    if (!isFlying && lastPose && controls) {
      fromPoint.copy(camera.position).sub(controls.target);
      angleRef.current = getCameraAngle(fromPoint);
      zoomScaleRef.current *=
        getCameraDistance({ viewport: size, zoom: lastPose.zoom }) / fromPoint.length();
    }

    const framing =
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
    const target = { ...framing, zoom: framing.zoom * zoomScaleRef.current };
    const anchor = getFocusPosition({ focus: flight.anchor, sceneState });
    const focusAngle = getFocusAngle({ flight, sceneState });
    const pose =
      isFlying && anchor
        ? mixPoses({
            from: flight.from,
            to: target,
            anchor,
            progress: flight.progress,
            fromAngle: flight.fromAngle,
            toAngle: focusAngle,
            swing: flight.swing,
          })
        : target;
    // Settled, the visitor steers, except in the cockpit, which keeps turning with the ship.
    const settledAngle = flight.focus.kind === "ship" ? focusAngle : angleRef.current;
    const angle = isFlying
      ? mixAngles({
          from: flight.fromAngle,
          to: focusAngle,
          progress: flight.progress,
          swing: flight.swing,
        })
      : settledAngle;
    poseRef.current = pose;
    angleRef.current = angle;
    sceneState.cameraZoom = pose.zoom;

    const placement = getCameraPlacement({ pose, angle, viewport: size });
    camera.fov =
      CAMERA_FOV +
      Math.sin(Math.PI * flight.progress) * FLIGHT_FOV_PUSH +
      // The brake dips a launch's warp under 0, on purpose; the jump has no brake.
      (sceneState.jump > 0 ? getSceneWarp(sceneState) : sceneState.warp) * WARP_FOV_PUSH;
    camera.position.set(...placement.position);
    camera.lookAt(...placement.target);
    // Flying into the black hole, the view lifts: straight ahead moves from the ship, behind
    // the console, up into the middle of the windshield.
    const jumpCenter = getJumpCenter(sceneState.jump);
    const jumpLift = size.height * getJumpLift(size.width < PHONE_MAX_WIDTH);
    camera.setViewOffset(
      size.width,
      size.height,
      placement.viewOffset.x * (1 - jumpCenter),
      placement.viewOffset.y + (jumpLift - placement.viewOffset.y) * jumpCenter,
      size.width,
      size.height,
    );
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.set(...placement.target);
      // The visitor steers only at rest: not during a flight, a launch or in the cockpit.
      controls.enabled = !isFlying && !isLaunching && flight.focus.kind !== "ship";
    }
  });

  return { distanceLimits: getDistanceLimits(size) };
}
