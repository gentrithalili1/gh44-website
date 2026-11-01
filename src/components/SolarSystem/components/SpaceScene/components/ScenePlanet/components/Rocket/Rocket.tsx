import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import type { Group } from "three";

import type { SceneState } from "#/components/SolarSystem/components/SpaceScene/types";
import {
  getPlaneYaw,
  toPlanePosition,
} from "#/components/SolarSystem/components/SpaceScene/utils/sceneMath";
import { getRocketPose, ROCKET_LENGTH } from "#/components/SolarSystem/utils/space";
import { SPACE_COLORS } from "#/utils/palette";

// About one lap every 5 seconds, like the preview.
const ROCKET_SPEED = 1.2;
// A cone from its tail to its nose, which reaches ROCKET_LENGTH past the rocket's center.
const ROCKET_RADIUS = 1.4;
const ROCKET_HEIGHT = ROCKET_LENGTH * 1.6;
const ROCKET_SEGMENTS = 12;
// The cone points up; laid down, it points its nose along -z.
const NOSE_FORWARD = -Math.PI / 2;

interface RocketProps {
  planetSize: number;
  sceneStateRef: RefObject<SceneState>;
}

// gh44-confirm's rocket circles Mars around its equator, nose along its path.
export function Rocket({ planetSize, sceneStateRef }: RocketProps) {
  const groupRef = useRef<Group>(null);
  const angleRef = useRef(0);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    angleRef.current += ROCKET_SPEED * sceneStateRef.current.frameStep;
    const pose = getRocketPose({ planetSize, angle: angleRef.current });
    group.position.set(...toPlanePosition(pose));
    group.rotation.y = getPlaneYaw(pose.rotation);
  });

  return (
    <group ref={groupRef}>
      <mesh rotation-x={NOSE_FORWARD} position-z={ROCKET_HEIGHT / 2 - ROCKET_LENGTH}>
        <coneGeometry args={[ROCKET_RADIUS, ROCKET_HEIGHT, ROCKET_SEGMENTS]} />
        <meshLambertMaterial color={SPACE_COLORS.foreground} />
      </mesh>
    </group>
  );
}
