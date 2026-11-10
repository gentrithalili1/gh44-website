import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { DoubleSide, type Group } from "three";

import { messages } from "#/components/SolarSystem/messages";
import { PALETTE } from "#/utils/palette";

import { MAX_FRAME_STEP } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";
import { getPassPosition, stepPass, type VoyagerPass, WAITING } from "./utils/voyagerPass";

// The probe in its own units: a dish, the bus behind it and two booms.
const DISH = { radius: 4.2, depth: 1.4 } as const;
const BUS = { radius: 1.5, length: 1.6 } as const;
const BOOM = { radius: 0.18, length: 12 } as const;
const SEGMENTS = 16;
const HIT_RADIUS = 14;
// Drawn larger than life, or it would be lost among the stars.
const PROBE_SCALE = 1.5;
const QUARTER_TURN = Math.PI / 2;
// It turns slowly as it goes, radians a second.
const SPIN_SPEED = 0.12;
const NAME_POSITION: [number, number, number] = [0, DISH.radius, 0];

interface VoyagerProps {
  // The home view with nothing open: the only place it shows up.
  isHome: boolean;
}

// An easter egg: leave the home view alone for two minutes and a small probe crosses the system
// behind the sun, once a visit. It names itself when pointed at.
export function Voyager({ isHome }: VoyagerProps) {
  const groupRef = useRef<Group>(null);
  const passRef = useRef<VoyagerPass>(WAITING);
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
    group.rotation.x += SPIN_SPEED * delta;
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
    // Heading right: the dish looks back at the sun it left.
    <group ref={groupRef} scale={PROBE_SCALE}>
      <mesh rotation-z={QUARTER_TURN} position-x={-DISH.depth / 2}>
        <coneGeometry args={[DISH.radius, DISH.depth, SEGMENTS, 1, true]} />
        <meshLambertMaterial color={PALETTE.neutral.soft} side={DoubleSide} />
      </mesh>
      <mesh rotation-z={QUARTER_TURN} position-x={BUS.length / 2}>
        <cylinderGeometry args={[BUS.radius, BUS.radius, BUS.length, SEGMENTS / 2]} />
        <meshLambertMaterial color={PALETTE.ochre.soft} />
      </mesh>
      <mesh rotation-x={QUARTER_TURN} position-x={BUS.length / 2}>
        <cylinderGeometry args={[BOOM.radius, BOOM.radius, BOOM.length, SEGMENTS / 4]} />
        <meshLambertMaterial color={PALETTE.neutral.vivid} />
      </mesh>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[HIT_RADIUS, SEGMENTS, SEGMENTS / 2]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {isHovered ? <HoverName name={messages.voyager} position={NAME_POSITION} /> : null}
    </group>
  );
}
