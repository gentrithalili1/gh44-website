import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";

import { getOrbitPosition } from "#/components/SolarSystem/utils/space";
import { SPACE_COLORS } from "#/utils/palette";
import { SOLAR_SYSTEM } from "#/utils/planets";

import { setGroupOpacity } from "../../utils/groupOpacity";
import { damp, FADED_OPACITY, toPlanePosition } from "../../utils/sceneMath";

const ORBIT_SEGMENTS = 256;

// A planet's orbit, laid on the orbit plane.
function getOrbitPositions(radius: number) {
  return new Float32Array(
    Array.from({ length: ORBIT_SEGMENTS }, (_, index) =>
      toPlanePosition(getOrbitPosition({ radius, phase: (index / ORBIT_SEGMENTS) * Math.PI * 2 })),
    ).flat(),
  );
}

interface OrbitsProps {
  isPlanetOpen: boolean;
}

// One hairline per planet on the orbit plane; WebGL lines stay 1px at any distance.
export function Orbits({ isPlanetOpen }: OrbitsProps) {
  const [orbits] = useState(() =>
    SOLAR_SYSTEM.map((planet) => ({
      id: planet.id,
      positions: getOrbitPositions(planet.orbit.radius),
    })),
  );
  const groupRef = useRef<Group>(null);
  const opacityRef = useRef(1);

  useFrame((_, delta) => {
    opacityRef.current = damp({
      current: opacityRef.current,
      target: isPlanetOpen ? FADED_OPACITY : 1,
      delta,
    });
    if (groupRef.current) setGroupOpacity({ group: groupRef.current, opacity: opacityRef.current });
  });

  return (
    <group ref={groupRef}>
      {orbits.map(({ id, positions }) => (
        <lineLoop key={id}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={SPACE_COLORS.rule} transparent depthWrite={false} />
        </lineLoop>
      ))}
    </group>
  );
}
