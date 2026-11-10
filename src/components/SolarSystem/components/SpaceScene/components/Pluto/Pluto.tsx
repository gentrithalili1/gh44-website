import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type RefObject, useRef, useState } from "react";
import type { Group } from "three";

import { messages } from "#/components/SolarSystem/messages";
import { getOrbitPosition } from "#/components/SolarSystem/utils/space";
import { PALETTE } from "#/utils/palette";

import type { SceneState } from "../../types";
import { setGroupOpacity } from "../../utils/groupOpacity";
import { damp, FADED_OPACITY, toPlanePosition } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";
import { getPlutoAngle, PLUTO } from "./utils/plutoOrbit";

const SEGMENTS = 16;
// A speck is hard to point at: a wider, invisible target catches the pointer.
const HIT_AREA_SCALE = 5;
const NAME_POSITION: [number, number, number] = [0, PLUTO.radius, 0];

interface PlutoProps {
  // Steps back with the rest of the system.
  isFaded: boolean;
  sceneStateRef: RefObject<SceneState>;
}

// An easter egg: a grey speck past the last orbit, with no label. It names itself when pointed
// at and holds still. Nothing to click.
export function Pluto({ isFaded, sceneStateRef }: PlutoProps) {
  const groupRef = useRef<Group>(null);
  const timeRef = useRef(0);
  const opacityRef = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    if (!isHovered) timeRef.current += sceneStateRef.current.frameStep;
    group.position.set(
      ...toPlanePosition(
        getOrbitPosition({ radius: PLUTO.orbitRadius, phase: getPlutoAngle(timeRef.current) }),
      ),
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

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[PLUTO.radius, SEGMENTS, SEGMENTS / 2]} />
        <meshLambertMaterial color={PALETTE.neutral.vivid} />
      </mesh>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[PLUTO.radius * HIT_AREA_SCALE, SEGMENTS, SEGMENTS / 2]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {isHovered ? <HoverName name={messages.pluto} position={NAME_POSITION} /> : null}
    </group>
  );
}
