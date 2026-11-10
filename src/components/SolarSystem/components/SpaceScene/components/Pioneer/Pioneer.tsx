import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";

import { messages } from "#/components/SolarSystem/messages";

import { MAX_FRAME_STEP } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";
import { PROBE_REACH, PROBE_TOP, ProbeModel } from "../ProbeModel";
import { getPassPosition, type PioneerPass, stepPass, WAITING } from "./utils/pioneerPass";

const SEGMENTS = 16;
const NAME_POSITION: [number, number, number] = [0, PROBE_TOP, 0];

interface PioneerProps {
  // The home view with nothing open: the only place it shows up.
  isHome: boolean;
}

// An easter egg: leave the home view alone for ten seconds and a small probe crosses the system
// behind the sun, once a visit, its dish turned back toward home. It names itself when pointed
// at.
export function Pioneer({ isHome }: PioneerProps) {
  const groupRef = useRef<Group>(null);
  const passRef = useRef<PioneerPass>(WAITING);
  // Where the pointer was last frame: it moving is the visitor being there.
  const pointerRef = useRef({ x: 0, y: 0 });
  const [isCrossing, setIsCrossing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useFrame(({ pointer }, frameDelta) => {
    const delta = Math.min(frameDelta, MAX_FRAME_STEP);
    const isPointerStill = pointer.x === pointerRef.current.x && pointer.y === pointerRef.current.y;
    pointerRef.current = { x: pointer.x, y: pointer.y };
    const pass = stepPass({ pass: passRef.current, delta, isIdle: isHome && isPointerStill });
    if (pass.status !== passRef.current.status) setIsCrossing(pass.status === "crossing");
    passRef.current = pass;
    const group = groupRef.current;
    if (!group || pass.status !== "crossing") return;
    group.position.set(...getPassPosition(pass.progress));
    group.lookAt(0, 0, 0);
  });

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setIsHovered(true);
  }

  function handlePointerOut() {
    setIsHovered(false);
  }

  if (!isCrossing) return null;

  return (
    <group ref={groupRef}>
      <ProbeModel />
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[PROBE_REACH, SEGMENTS, SEGMENTS / 2]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {isHovered ? <HoverName name={messages.pioneer} position={NAME_POSITION} /> : null}
    </group>
  );
}
