import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";

import { messages } from "#/components/SolarSystem/messages";
import { PALETTE } from "#/utils/palette";

import { setGroupOpacity } from "../../utils/groupOpacity";
import { damp, FADED_OPACITY, MAX_FRAME_STEP } from "../../utils/sceneMath";
import { HOMESTEAD_POSITION } from "../../utils/homestead";
import { HoverName } from "../HoverName";

const RADIUS = 34;
const SEGMENTS = 32;
// A band of cloud round it, standing a little off the ground, turning once in about 80 seconds.
const CLOUDS = { lift: 1.04, thickness: 0.05, speed: 0.08 } as const;
const CLOUD_TILT: [number, number, number] = [1.35, 0.2, 0];
const NAME_POSITION: [number, number, number] = [0, RADIUS * 1.3, 0];

interface HomesteadProps {
  // Steps back with the rest of the system.
  isFaded: boolean;
}

export function Homestead({ isFaded }: HomesteadProps) {
  const groupRef = useRef<Group>(null);
  const cloudsRef = useRef<Group>(null);
  const opacityRef = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((_, frameDelta) => {
    const delta = Math.min(frameDelta, MAX_FRAME_STEP);
    if (cloudsRef.current) cloudsRef.current.rotation.z += CLOUDS.speed * delta;
    opacityRef.current = damp({
      current: opacityRef.current,
      target: isFaded ? FADED_OPACITY : 1,
      delta,
    });
    if (groupRef.current) setGroupOpacity({ group: groupRef.current, opacity: opacityRef.current });
  });

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setIsHovered(true);
  }

  function handlePointerOut() {
    setIsHovered(false);
  }

  return (
    <group ref={groupRef} position={HOMESTEAD_POSITION}>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[RADIUS, SEGMENTS, SEGMENTS / 2]} />
        <meshLambertMaterial color={PALETTE.sage.soft} />
      </mesh>
      <group rotation={CLOUD_TILT}>
        <group ref={cloudsRef}>
          <mesh>
            <torusGeometry
              args={[RADIUS * CLOUDS.lift, RADIUS * CLOUDS.thickness, 8, SEGMENTS, 4.4]}
            />
            <meshLambertMaterial color={PALETTE.neutral.soft} />
          </mesh>
        </group>
      </group>
      {isHovered ? <HoverName name={messages.homestead} position={NAME_POSITION} /> : null}
    </group>
  );
}
