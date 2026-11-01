import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";

import { SPACE_COLORS } from "#/utils/palette";
import { SOLAR_SYSTEM } from "#/utils/planets";

import { setGroupOpacity } from "../../utils/groupOpacity";
import { damp, FADED_OPACITY } from "../../utils/sceneMath";

const ORBIT_SEGMENTS = 256;

// Behind the planets and the sun.
const ORBIT_DEPTH = -3;

function getOrbitPositions(radius: number) {
  return new Float32Array(
    Array.from({ length: ORBIT_SEGMENTS }, (_, index) => {
      const angle = (index / ORBIT_SEGMENTS) * Math.PI * 2;
      return [Math.cos(angle) * radius, Math.sin(angle) * radius, ORBIT_DEPTH];
    }).flat(),
  );
}

interface OrbitsProps {
  isPlanetOpen: boolean;
}

// One hairline per planet; WebGL lines stay 1px at any zoom.
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
          <lineBasicMaterial color={SPACE_COLORS.rule} transparent />
        </lineLoop>
      ))}
    </group>
  );
}
