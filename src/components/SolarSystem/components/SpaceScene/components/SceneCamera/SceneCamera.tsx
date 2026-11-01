import type { RefObject } from "react";

import { useCameraFlight } from "../../hooks/useCameraFlight";
import type { SceneState } from "../../types";

interface SceneCameraProps {
  openPlanetId: string | undefined;
  sceneStateRef: RefObject<SceneState>;
}

export function SceneCamera({ openPlanetId, sceneStateRef }: SceneCameraProps) {
  useCameraFlight({ openPlanetId, sceneStateRef });

  return null;
}
