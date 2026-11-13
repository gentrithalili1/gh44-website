import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";

import { messages } from "#/components/SolarSystem/messages";
import { PALETTE } from "#/utils/palette";

import { setGroupOpacity } from "../../utils/groupOpacity";
import { damp, FADED_OPACITY, MAX_FRAME_STEP } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";
import { getRingModules, RING_RADIUS } from "./utils/enduranceRing";

const POSITION: [number, number, number] = [1914, -2208, -3395];
// The wheel leans toward the home view, and turns once in about 26 seconds for gravity.
const LEAN: [number, number, number] = [-0.5, -0.45, 0];
const SPIN_SPEED = 0.24;
// Drawn far larger than life, or it would be lost among the stars.
const SHIP_SCALE = 6;
const HIT_RADIUS = RING_RADIUS + 2.5;
const NAME_POSITION: [number, number, number] = [0, (RING_RADIUS + 2) * SHIP_SCALE, 0];
// The rim tube joining the modules, and the two tunnels across the wheel to the hub.
const RIM = { tube: 0.32, segments: 6, sides: 48 } as const;
const TUNNEL = { width: 0.7, depth: 0.7 } as const;
const HUB = { size: 2.2, depth: 2.6 } as const;
// The landers docked on the hub.
const LANDER = { size: 1.1, length: 2.2, offset: 1.9 } as const;
const HALF_TURN = Math.PI;

const WHITE = PALETTE.neutral.soft;
const GREY = PALETTE.neutral.vivid;

interface EnduranceProps {
  // Steps back with the rest of the system.
  isFaded: boolean;
}

export function Endurance({ isFaded }: EnduranceProps) {
  const [modules] = useState(getRingModules);
  const groupRef = useRef<Group>(null);
  const wheelRef = useRef<Group>(null);
  const opacityRef = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((_, frameDelta) => {
    const delta = Math.min(frameDelta, MAX_FRAME_STEP);
    if (wheelRef.current) wheelRef.current.rotation.z += SPIN_SPEED * delta;
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
    <group ref={groupRef} position={POSITION}>
      <group rotation={LEAN} scale={SHIP_SCALE}>
        <group ref={wheelRef}>
          <mesh>
            <torusGeometry args={[RING_RADIUS, RIM.tube, RIM.segments, RIM.sides]} />
            <meshLambertMaterial color={GREY} />
          </mesh>
          {modules.map((module) => (
            <mesh key={module.id} position={[module.x, module.y, 0]} rotation-z={module.turn}>
              <boxGeometry args={[...module.size]} />
              <meshLambertMaterial color={WHITE} />
            </mesh>
          ))}
          {[0, HALF_TURN / 2].map((turn) => (
            <mesh key={turn} rotation-z={turn}>
              <boxGeometry args={[RING_RADIUS * 2, TUNNEL.width, TUNNEL.depth]} />
              <meshLambertMaterial color={GREY} />
            </mesh>
          ))}
          <mesh>
            <boxGeometry args={[HUB.size, HUB.size, HUB.depth]} />
            <meshLambertMaterial color={WHITE} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * LANDER.offset, side * 0.5, HUB.depth / 2]}>
              <boxGeometry args={[LANDER.size, LANDER.length, LANDER.size]} />
              <meshLambertMaterial color={GREY} />
            </mesh>
          ))}
        </group>
      </group>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[HIT_RADIUS * SHIP_SCALE, 16, 8]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {isHovered ? <HoverName name={messages.endurance} position={NAME_POSITION} /> : null}
    </group>
  );
}
