import { OrbitControls } from "@react-three/drei";
import { type ComponentRef, type RefObject, useRef } from "react";

import { useCameraFlight } from "../../hooks/useCameraFlight";
import type { SceneState } from "../../types";

// The camera may orbit down to just above the orbit plane, never under the system.
const MIN_POLAR_ANGLE = 0.1;
const MAX_POLAR_ANGLE = Math.PI / 2 - 0.12;

interface SceneCameraProps {
  openPlanetId: string | undefined;
  sceneStateRef: RefObject<SceneState>;
}

// The camera's flights, and limited orbit controls between them: drag to orbit, scroll or pinch
// to zoom, no panning.
export function SceneCamera({ openPlanetId, sceneStateRef }: SceneCameraProps) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const cameraFlight = useCameraFlight({ openPlanetId, sceneStateRef, controlsRef });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={cameraFlight.distanceLimits.min}
      maxDistance={cameraFlight.distanceLimits.max}
      minPolarAngle={MIN_POLAR_ANGLE}
      maxPolarAngle={MAX_POLAR_ANGLE}
    />
  );
}
