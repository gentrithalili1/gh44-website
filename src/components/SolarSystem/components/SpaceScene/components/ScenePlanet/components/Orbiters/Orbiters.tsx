import { type RefObject, useState } from "react";

import type { Orbiter as OrbiterData } from "#/components/SolarSystem/utils/orbiters";
import { SPACE_COLORS } from "#/utils/palette";

import type { SceneState } from "../../../../types";
import type { HoverChange } from "../../types";
import { getTiltedOrbitPositions } from "../../utils/sceneGeometry";
import { Orbiter } from "./components/Orbiter";

const ORBIT_OPACITY = 0.14;

interface OrbitersProps {
  orbiters: OrbiterData[];
  isPlanetOpen: boolean;
  onHoverChange: (change: HoverChange) => void;
  onPlanetClick: () => void;
  sceneStateRef: RefObject<SceneState>;
}

// A planet's moons and satellites, each on a tilted orbit that passes behind and in front of it.
export function Orbiters({
  orbiters,
  isPlanetOpen,
  onHoverChange,
  onPlanetClick,
  sceneStateRef,
}: OrbitersProps) {
  const [orbits] = useState(() =>
    orbiters.map((orbiter) => ({
      orbiter,
      positions: getTiltedOrbitPositions(orbiter.orbitRadius),
    })),
  );

  return orbits.map(({ orbiter, positions }) => (
    <group key={orbiter.id}>
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={SPACE_COLORS.muted}
          transparent
          opacity={ORBIT_OPACITY}
          userData={{ baseOpacity: ORBIT_OPACITY }}
        />
      </lineLoop>
      <Orbiter
        orbiter={orbiter}
        isPlanetOpen={isPlanetOpen}
        onHoverChange={onHoverChange}
        onPlanetClick={onPlanetClick}
        sceneStateRef={sceneStateRef}
      />
    </group>
  ));
}
