import { DoubleSide } from "three";

import type { UprightRing as UprightRingData } from "#/components/SolarSystem/utils/rings";
import { PALETTE } from "#/utils/palette";

const RING_SEGMENTS = 96;
// The far half sits behind the planet, the near half in front of its surface.
const FAR_DEPTH = -1;
const NEAR_DEPTH = 1;

interface UprightRingProps {
  ring: UprightRingData;
}

// Uranus' thin ring, standing almost upright: its left half passes behind the planet, its right
// half in front.
export function UprightRing({ ring }: UprightRingProps) {
  const color = PALETTE[ring.color].soft;

  return (
    <group rotation-z={-ring.lean}>
      <group scale-x={ring.squash}>
        <mesh position-z={FAR_DEPTH}>
          <ringGeometry args={[ring.innerRadius, ring.outerRadius, RING_SEGMENTS]} />
          <meshBasicMaterial color={color} side={DoubleSide} />
        </mesh>
        <mesh position-z={NEAR_DEPTH}>
          <ringGeometry
            args={[ring.innerRadius, ring.outerRadius, RING_SEGMENTS, 1, -Math.PI / 2, Math.PI]}
          />
          <meshBasicMaterial color={color} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
