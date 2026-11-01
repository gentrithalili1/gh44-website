import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { DoubleSide, type Group } from "three";

import { SYSTEM_SIZE } from "#/components/SolarSystem/utils/space";
import { SPACE_COLORS } from "#/utils/palette";
import { SOLAR_SYSTEM } from "#/utils/planets";

import { setGroupOpacity } from "../../utils/groupOpacity";
import { damp, FADED_OPACITY } from "../../utils/sceneMath";

const ORBIT_SEGMENTS = 256;
// About a pixel wide from home on any screen.
const ORBIT_WIDTH_PX = 1;
// Lies flat on the orbit plane.
const FLAT = -Math.PI / 2;

interface OrbitsProps {
  isPlanetOpen: boolean;
}

// One thin ring per planet, flat on the orbit plane.
export function Orbits({ isPlanetOpen }: OrbitsProps) {
  const size = useThree((state) => state.size);
  const groupRef = useRef<Group>(null);
  const opacityRef = useRef(1);

  const halfWidth = (ORBIT_WIDTH_PX * SYSTEM_SIZE) / Math.min(size.width, size.height) / 2;

  useFrame((_, delta) => {
    opacityRef.current = damp({
      current: opacityRef.current,
      target: isPlanetOpen ? FADED_OPACITY : 1,
      delta,
    });
    if (groupRef.current) setGroupOpacity({ group: groupRef.current, opacity: opacityRef.current });
  });

  return (
    <group ref={groupRef} rotation-x={FLAT}>
      {SOLAR_SYSTEM.map((planet) => (
        <mesh key={planet.id}>
          <ringGeometry
            args={[
              planet.orbit.radius - halfWidth,
              planet.orbit.radius + halfWidth,
              ORBIT_SEGMENTS,
            ]}
          />
          <meshBasicMaterial
            color={SPACE_COLORS.rule}
            transparent
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
