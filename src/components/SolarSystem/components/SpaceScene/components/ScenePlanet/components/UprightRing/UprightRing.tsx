import { DoubleSide } from "three";

import type { UprightRing as UprightRingData } from "#/components/SolarSystem/utils/rings";
import { PALETTE } from "#/utils/palette";

const RING_SEGMENTS = 96;

interface UprightRingProps {
  ring: UprightRingData;
}

// Uranus' thin ring, standing almost upright: turned nearly edge on to the home view, so it shows
// as a tall, narrow loop, leaning a little.
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
