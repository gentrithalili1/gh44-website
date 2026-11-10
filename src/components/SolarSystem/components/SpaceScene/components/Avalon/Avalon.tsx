import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { type Group, Quaternion, Vector3 } from "three";

import { messages } from "#/components/SolarSystem/messages";
import { PALETTE } from "#/utils/palette";

import { setGroupOpacity } from "../../utils/groupOpacity";
import { damp, FADED_OPACITY, MAX_FRAME_STEP } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";
import { BLADE, getBladeTurns } from "./utils/avalonBlades";

// Outside the last orbit, in the bottom left of the home view: on the orbit plane, toward the
// viewer. Scene units.
const POSITION: [number, number, number] = [-500, 30, 460];
// Nose away from the sun, toward Homestead II further out the same way, and tipped up toward
// the home view, so its hulls are seen wheeling round the spine like the Endurance's ring.
const NOSE = new Vector3(0.14, 0.79, 0.6).normalize();
const HEADING = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), NOSE);
// The hulls turn round the spine once in about 40 seconds for gravity, like the Endurance.
const SPIN_SPEED = 0.16;
// Drawn far larger than life, or it would be lost among the stars.
const SHIP_SCALE = 2.4;
// The spine runs along the ship's length (its x axis), the engine at its tail.
const SPINE = { length: 17, radius: 0.45 } as const;
const ENGINE = { radius: 1.5, length: 1.8, glow: 1.25 } as const;
const HUB = { radius: 1.3, length: 2.2 } as const;
// A hull's cross-section: thin, and this many times deeper than thin.
const BLADE_TUBE = 0.42;
const BLADE_DEPTH = 2.6;
const STRUT = { radius: 0.16 } as const;
// The lit windows along each hull: how many, and how big.
const WINDOWS = { count: 5, radius: 0.22 } as const;
const WINDOW_IDS = Array.from({ length: WINDOWS.count }, (_, index) => index);
const ROUND = 16;
const QUARTER_TURN = Math.PI / 2;
const HIT_RADIUS = SPINE.length / 2 + 1;
const NAME_POSITION: [number, number, number] = [0, (BLADE.offset + 4) * SHIP_SCALE, 0];

const HULL = PALETTE.neutral.vivid;
const LIGHT = PALETTE.sky.soft;

interface AvalonProps {
  // Steps back with the rest of the system.
  isFaded: boolean;
}

// A ship from another story, leaving the solar system behind for Homestead II: three long
// curved hulls turning round a spine, an engine glowing at its tail. It shows its name when pointed at. Decorative
// otherwise: nothing to click.
export function Avalon({ isFaded }: AvalonProps) {
  const [bladeTurns] = useState(getBladeTurns);
  const groupRef = useRef<Group>(null);
  const hullsRef = useRef<Group>(null);
  const opacityRef = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((_, frameDelta) => {
    const delta = Math.min(frameDelta, MAX_FRAME_STEP);
    if (hullsRef.current) hullsRef.current.rotation.x += SPIN_SPEED * delta;
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
      <group quaternion={HEADING} scale={SHIP_SCALE}>
        <mesh rotation-z={QUARTER_TURN}>
          <cylinderGeometry args={[SPINE.radius, SPINE.radius, SPINE.length, ROUND / 2]} />
          <meshLambertMaterial color={HULL} />
        </mesh>
        <mesh rotation-z={QUARTER_TURN} position-x={-SPINE.length / 2}>
          <cylinderGeometry args={[ENGINE.radius * 0.7, ENGINE.radius, ENGINE.length, ROUND]} />
          <meshLambertMaterial color={HULL} />
        </mesh>
        {/* The engine's glow: round, so it shows from any side. */}
        <mesh position-x={-SPINE.length / 2 - ENGINE.length / 2}>
          <sphereGeometry args={[ENGINE.glow, ROUND, ROUND / 2]} />
          <meshBasicMaterial color={LIGHT} />
        </mesh>
        <mesh rotation-z={QUARTER_TURN} position-x={SPINE.length / 2 - HUB.length}>
          <cylinderGeometry args={[HUB.radius, HUB.radius, HUB.length, ROUND]} />
          <meshLambertMaterial color={HULL} />
        </mesh>
        <group ref={hullsRef}>
          {bladeTurns.map((turn) => (
            <group key={turn} rotation-x={turn}>
              {/* The arc bows away from the spine, its ends swept back toward it. */}
              <group position-y={BLADE.offset - BLADE.radius} position-x={1}>
                <mesh rotation-z={QUARTER_TURN - BLADE.arc / 2} scale={[1, 1, BLADE_DEPTH]}>
                  <torusGeometry args={[BLADE.radius, BLADE_TUBE, 6, 28, BLADE.arc]} />
                  <meshLambertMaterial color={HULL} />
                </mesh>
                {WINDOW_IDS.map((id) => {
                  const angle = QUARTER_TURN + (id / (WINDOWS.count - 1) - 0.5) * BLADE.arc * 0.8;

                  return (
                    <mesh
                      key={id}
                      position={[
                        Math.cos(angle) * BLADE.radius,
                        Math.sin(angle) * (BLADE.radius + BLADE_TUBE),
                        0,
                      ]}
                    >
                      <sphereGeometry args={[WINDOWS.radius, 8, 6]} />
                      <meshBasicMaterial color={LIGHT} />
                    </mesh>
                  );
                })}
              </group>
              <mesh position={[1, BLADE.offset / 2, 0]}>
                <cylinderGeometry args={[STRUT.radius, STRUT.radius, BLADE.offset, 6]} />
                <meshLambertMaterial color={HULL} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[HIT_RADIUS * SHIP_SCALE, ROUND, ROUND / 2]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {isHovered ? <HoverName name={messages.avalon} position={NAME_POSITION} /> : null}
    </group>
  );
}
