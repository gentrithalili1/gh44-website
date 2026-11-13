import type { RefObject } from "react";

import type { SceneState } from "../../types";
import { ExplorerShip } from "./components/ExplorerShip";

interface ShipsProps {
  openPlanetId: string | undefined;
  sceneStateRef: RefObject<SceneState>;
}

export function Ships({ openPlanetId, sceneStateRef }: ShipsProps) {
  return (
    <group name="ships">
      <ExplorerShip openPlanetId={openPlanetId} sceneStateRef={sceneStateRef} />
    </group>
  );
}
