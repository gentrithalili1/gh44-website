import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";

import { messages } from "#/components/SolarSystem/messages";
import { PALETTE } from "#/utils/palette";

import { setGroupOpacity } from "../../utils/groupOpacity";
import { damp, FADED_OPACITY, MAX_FRAME_STEP } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";

// On the way from the Endurance to the black hole, close to it: far out, below the orbit plane
// and behind the system. Scene units.
const POSITION: [number, number, number] = [1890, -2180, -3350];
const RADIUS = 52;
const SEGMENTS = 32;
// The wave: a white ridge part of the way round the water, standing this far out of it, as thick
// as this share of the planet, and rolling round once in about a minute.
const WAVE = { lift: 1.03, thickness: 0.07, arc: 1.9, speed: 0.1 } as const;
const WAVE_TILT: [number, number, number] = [1.2, 0.3, 0];
const NAME_POSITION: [number, number, number] = [0, RADIUS * 1.3, 0];

interface MillersPlanetProps {
  // Steps back with the rest of the system.
  isFaded: boolean;
}

// A planet from another story, on the Endurance's route, close to the black hole: all water,
// with one enormous wave rolling round it. It shows its name when pointed at. Decorative
// otherwise: nothing to click.
export function MillersPlanet({ isFaded }: MillersPlanetProps) {
  const groupRef = useRef<Group>(null);
  const waveRef = useRef<Group>(null);
  const opacityRef = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((_, frameDelta) => {
    const delta = Math.min(frameDelta, MAX_FRAME_STEP);
    if (waveRef.current) waveRef.current.rotation.z += WAVE.speed * delta;
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
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[RADIUS, SEGMENTS, SEGMENTS / 2]} />
        <meshLambertMaterial color={PALETTE.sky.soft} />
      </mesh>
      <group rotation={WAVE_TILT}>
        <group ref={waveRef}>
          <mesh>
            <torusGeometry
              args={[RADIUS * WAVE.lift, RADIUS * WAVE.thickness, 8, SEGMENTS, WAVE.arc]}
            />
            <meshLambertMaterial color={PALETTE.neutral.soft} />
          </mesh>
        </group>
      </group>
      {isHovered ? <HoverName name={messages.millersPlanet} position={NAME_POSITION} /> : null}
    </group>
  );
}
