import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type RefObject, useRef, useState } from "react";
import type { Group } from "three";

import { messages } from "#/components/SolarSystem/messages";
import { getOrbitPosition } from "#/components/SolarSystem/utils/space";
import { useSecrets } from "#/hooks/useSecrets";
import { PALETTE } from "#/utils/palette";

import type { SceneState } from "../../types";
import { setGroupOpacity } from "../../utils/groupOpacity";
import { damp, FADED_OPACITY, toPlanePosition } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";

// Between Earth's orbit (148) and Mars' (200), quick: one lap in about 16 seconds.
const BALL = { radius: 2.6, orbitRadius: 174, speed: 0.4 } as const;
const SEGMENTS = 16;
const HIT_AREA_SCALE = 4;
const NAME_POSITION: [number, number, number] = [0, BALL.radius, 0];

interface FetchBallProps {
  // Steps back with the rest of the system.
  isFaded: boolean;
  sceneStateRef: RefObject<SceneState>;
}

export function FetchBall({ isFaded, sceneStateRef }: FetchBallProps) {
  const secrets = useSecrets();
  const groupRef = useRef<Group>(null);
  // Radians round the sun; it starts beside the ship.
  const angleRef = useRef<number | null>(null);
  const opacityRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const sceneState = sceneStateRef.current;
    const { x, y } = sceneState.shipPose;
    angleRef.current ??= Math.atan2(y, x);
    if (!isHovered) angleRef.current += BALL.speed * sceneState.frameStep;
    group.position.set(
      ...toPlanePosition(getOrbitPosition({ radius: BALL.orbitRadius, phase: angleRef.current })),
    );
    opacityRef.current = damp({
      current: opacityRef.current,
      target: isFaded ? FADED_OPACITY : 1,
      delta,
    });
    setGroupOpacity({ group, opacity: opacityRef.current });
  });

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setIsHovered(true);
  }

  function handlePointerOut() {
    setIsHovered(false);
  }

  if (!secrets.hasBall) return null;

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[BALL.radius, SEGMENTS, SEGMENTS / 2]} />
        <meshLambertMaterial color={PALETTE.rose.soft} />
      </mesh>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[BALL.radius * HIT_AREA_SCALE, SEGMENTS, SEGMENTS / 2]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {isHovered ? <HoverName name={messages.fetchBall} position={NAME_POSITION} /> : null}
    </group>
  );
}
