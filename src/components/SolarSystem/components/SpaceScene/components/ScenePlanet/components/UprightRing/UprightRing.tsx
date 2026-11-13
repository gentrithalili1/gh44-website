import { DoubleSide } from "three";

import type { UprightRing as UprightRingData } from "#/components/SolarSystem/utils/rings";
import { PALETTE } from "#/utils/palette";

const RING_SEGMENTS = 96;

interface UprightRingProps {
  ring: UprightRingData;
}

export function UprightRing({ ring }: UprightRingProps) {
  return (
    <group rotation-z={-ring.lean}>
      <mesh rotation-y={Math.acos(ring.squash)}>
        <ringGeometry args={[ring.innerRadius, ring.outerRadius, RING_SEGMENTS]} />
        <meshLambertMaterial color={PALETTE[ring.color].soft} side={DoubleSide} />
      </mesh>
    </group>
  );
}
