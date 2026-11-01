import { useGSAP } from "@gsap/react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { type RefObject, useRef } from "react";

import type { SceneState } from "../../types";
import { CAMERA_HEIGHT } from "../../utils/sceneMath";
import { type CameraPose, getCameraPose, getPlanetPosition, mixPoses } from "./utils/cameraFraming";

gsap.registerPlugin(useGSAP);

// The page's ease, cubic-bezier(0.33, 1, 0.68, 1): GSAP's cubic ease-out.
const FLIGHT_EASE = "power2.out";
const FLIGHT_IN_SECONDS = 1.4;
const FLIGHT_OUT_SECONDS = 1.2;

type Flight = {
  // Where the camera is headed: an open planet, or home.
  planetId: string | undefined;
  // The planet the flight is about (flown to, or left behind); it moves straight on screen.
  anchorId: string | undefined;
  from: CameraPose;
  // 0 at take-off, 1 on arrival; GSAP drives it.
  progress: number;
};

type UseCameraFlightParams = {
  openPlanetId: string | undefined;
  sceneStateRef: RefObject<SceneState>;
};

// Looks straight down. Opening a planet flies in and frames it beside the panel (or above the
// sheet); closing flies home. The first frame is already in place, so a deep link starts framed.
export function useCameraFlight({ openPlanetId, sceneStateRef }: UseCameraFlightParams) {
  const flightRef = useRef<Flight>({
    planetId: openPlanetId,
    anchorId: openPlanetId,
    from: { x: 0, y: 0, zoom: 1 },
    progress: 1,
  });
  const poseRef = useRef<CameraPose | null>(null);

  // Starts a flight when the open planet changes, even while the frame loop is paused; GSAP
  // kills a running flight on unmount.
  useGSAP(
    () => {
      const flight = flightRef.current;
      if (flight.planetId === openPlanetId) return;
      flight.anchorId = openPlanetId ?? flight.planetId;
      flight.planetId = openPlanetId;
      flight.from = poseRef.current ?? flight.from;
      flight.progress = 0;
      gsap.to(flight, {
        progress: 1,
        duration: openPlanetId ? FLIGHT_IN_SECONDS : FLIGHT_OUT_SECONDS,
        ease: FLIGHT_EASE,
        overwrite: true,
      });
    },
    { dependencies: [openPlanetId] },
  );

  useFrame(({ camera, size }) => {
    const flight = flightRef.current;
    const planetAngles = sceneStateRef.current.planetAngles;
    const target = getCameraPose({
      viewport: size,
      planetId: flight.planetId,
      planetAngle: flight.planetId ? planetAngles.get(flight.planetId) : undefined,
    });
    const anchor = getPlanetPosition({
      planetId: flight.anchorId,
      planetAngle: flight.anchorId ? planetAngles.get(flight.anchorId) : undefined,
    });
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
