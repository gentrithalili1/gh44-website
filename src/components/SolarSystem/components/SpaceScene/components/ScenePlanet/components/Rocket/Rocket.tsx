import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Mesh } from "three";

import {
  MAX_FRAME_STEP,
  toScenePosition,
} from "#/components/SolarSystem/components/SpaceScene/utils/sceneMath";
import { getRocketPose } from "#/components/SolarSystem/utils/space";
import { SPACE_COLORS } from "#/utils/palette";

import { createRocketOutline } from "../../utils/sceneGeometry";

// About one lap every 5 seconds, like the preview.
const ROCKET_SPEED = 1.2;

interface RocketProps {
  planetSize: number;
}

// confirm()'s rocket circles Mars flat, nose along its path.
export function Rocket({ planetSize }: RocketProps) {
  const [outline] = useState(createRocketOutline);
  const meshRef = useRef<Mesh>(null);
  const angleRef = useRef(0);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    angleRef.current += ROCKET_SPEED * Math.min(delta, MAX_FRAME_STEP);
    const pose = getRocketPose({ planetSize, angle: angleRef.current });
    const [x, y] = toScenePosition(pose);
    mesh.position.set(x, y, 1);
    // The screen's clockwise turn is negative around the camera's axis.
    mesh.rotation.z = -pose.rotation;
  });

  return (
    <mesh ref={meshRef}>
      <shapeGeometry args={[outline]} />
      <meshBasicMaterial color={SPACE_COLORS.foreground} />
    </mesh>
  );
}
