import type { RefObject } from "react";

import type { SceneState } from "../../types";
import { ExplorerShip } from "./components/ExplorerShip";

interface ShipsProps {
  openPlanetId: string | undefined;
  sceneStateRef: RefObject<SceneState>;
}

// The ships in the space: the gh44 explorer, for now. Room for more (an Interstellar-like ship, a
// Passengers-like ship, a Starship-like rocket).
export function Ships({ openPlanetId, sceneStateRef }: ShipsProps) {
  return (
    <group name="ships">
      <ExplorerShip openPlanetId={openPlanetId} sceneStateRef={sceneStateRef} />
    </group>
  );
}
