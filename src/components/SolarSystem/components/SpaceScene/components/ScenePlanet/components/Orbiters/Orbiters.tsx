import { type RefObject, useState } from "react";

import type { Orbiter as OrbiterData } from "#/components/SolarSystem/utils/orbiters";
import { SPACE_COLORS } from "#/utils/palette";

import type { SceneState } from "../../../../types";
import { toPlanePosition } from "../../../../utils/sceneMath";
import type { HoverChange } from "../../types";
import { Orbiter } from "./components/Orbiter";

const ORBIT_OPACITY = 0.14;
const ORBIT_SEGMENTS = 128;

// A moon or satellite orbit: a circle around the planet's equator, on the orbit plane.
function getOrbitPositions(radius: number) {
  return new Float32Array(
    Array.from({ length: ORBIT_SEGMENTS }, (_, index) => {
      const angle = (index / ORBIT_SEGMENTS) * Math.PI * 2;
      return toPlanePosition({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }).flat(),
  );
}

interface OrbitersProps {
  orbiters: OrbiterData[];
  isPlanetOpen: boolean;
  onHoverChange: (change: HoverChange) => void;
  onPlanetClick: () => void;
  sceneStateRef: RefObject<SceneState>;
}

// A planet's moons and satellites, each on its orbit around the planet's equator, passing behind
// and in front of it.
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
      positions: getOrbitPositions(orbiter.orbitRadius),
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
