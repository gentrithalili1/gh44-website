import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { AdditiveBlending, DoubleSide, type Group, Quaternion, Vector3 } from "three";

import { messages } from "#/components/SolarSystem/messages";
import { PALETTE } from "#/utils/palette";

import { setGroupOpacity } from "../../utils/groupOpacity";
import { HOMESTEAD_POSITION } from "../../utils/homestead";
import { damp, FADED_OPACITY, MAX_FRAME_STEP } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";
import {
  BLADE,
  BLADE_LIGHTS,
  getBladePoint,
  getBladeShape,
  getBladeTurns,
} from "./utils/avalonBlades";

// Outside the last orbit, in the bottom left of the home view: on the orbit plane, toward the
// viewer. Scene units.
const POSITION: [number, number, number] = [-500, 30, 460];
// Nose straight at Homestead II, further out the same way from the sun.
const NOSE = new Vector3(...HOMESTEAD_POSITION).sub(new Vector3(...POSITION)).normalize();
const HEADING = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), NOSE);
// The hulls turn round the spine once in about 20 seconds, for gravity.
const SPIN_SPEED = 0.32;
// Drawn far larger than life, or it would be lost among the stars.
const SHIP_SCALE = 2.2;

const QUARTER_TURN = Math.PI / 2;
const ROUND = 20;
// The spine: two rods side by side from the engine to the reactor at the nose.
const SPINE = { from: -9, to: 9, radius: 0.22, gap: 0.55 } as const;
// The domed engine at the tail, ribbed, and the blue glow of its nozzle.
const ENGINE = { x: -10.2, radius: 2.1, length: 2.6, ribs: 5 } as const;
const NOZZLE = { x: -11.6, radius: 1.5 } as const;
// The hub midway, ringed, and the reactor ring at the nose with its core lit.
const HUB = { x: 1.5, radius: 1.35, length: 3.4 } as const;
const HUB_RINGS = [0.1, 1.6, 3.1] as const;
const REACTOR = { x: 7.6, radius: 1.6, tube: 0.24, core: 0.55 } as const;
// Struts from the hub out to each hull.
const STRUTS = [
  { along: 0.22, x: 6 },
  { along: 0.62, x: 0.4 },
] as const;
const STRUT_RADIUS = 0.13;
// The engine pushes blue fire out of its tail, flickering.
const FLAME = { length: 10, radius: 1.35, core: 0.5, flicker: 0.14, speed: 17 } as const;
const FLAME_OPACITY = { outer: 0.5, core: 0.9 } as const;
const HIT_RADIUS = 13;
const NAME_POSITION: [number, number, number] = [
  0,
  (BLADE.lift + BLADE.sweep + BLADE.reach + 1) * SHIP_SCALE,
  0,
];

const HULL = PALETTE.neutral.vivid;
const DARK = PALETTE.neutral.vivid;
const WARM = PALETTE.ochre.soft;
const LIGHT = PALETTE.sky.soft;
const CORE = PALETTE.neutral.soft;

const LIGHT_SHARES = Array.from(
  { length: BLADE_LIGHTS.count },
  (_, index) =>
    BLADE_LIGHTS.from + ((BLADE_LIGHTS.to - BLADE_LIGHTS.from) * index) / (BLADE_LIGHTS.count - 1),
);
const RIB_IDS = Array.from({ length: ENGINE.ribs }, (_, index) => index);

interface AvalonProps {
  // Steps back with the rest of the system.
  isFaded: boolean;
}

// A ship from another story, leaving the solar system behind for Homestead II: a long spine
// from a domed engine to a reactor ring, a ringed hub, and three crescent hulls swept back round
// it, lit along their length and turning round the spine. Its engine pushes blue fire. It shows
// its name when pointed at. Decorative otherwise: nothing to click.
export function Avalon({ isFaded }: AvalonProps) {
  const [bladeTurns] = useState(getBladeTurns);
  const [bladeShape] = useState(getBladeShape);
  const groupRef = useRef<Group>(null);
  const hullsRef = useRef<Group>(null);
  const flameRef = useRef<Group>(null);
  const opacityRef = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  useFrame(({ clock }, frameDelta) => {
    const delta = Math.min(frameDelta, MAX_FRAME_STEP);
    if (hullsRef.current) hullsRef.current.rotation.x += SPIN_SPEED * delta;
    const time = clock.elapsedTime;
    const flicker = 1 + Math.sin(time * FLAME.speed) * FLAME.flicker * Math.sin(time * 7.3);
    flameRef.current?.scale.set(1, flicker, flicker);
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
        {/* The spine: twin rods. */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            rotation-z={QUARTER_TURN}
            position={[(SPINE.from + SPINE.to) / 2, (side * SPINE.gap) / 2, 0]}
          >
            <cylinderGeometry
              args={[SPINE.radius, SPINE.radius, SPINE.to - SPINE.from, ROUND / 2]}
            />
            <meshLambertMaterial color={DARK} />
          </mesh>
        ))}

        {/* The domed engine at the tail, ribbed. */}
        <mesh rotation-z={QUARTER_TURN} position-x={ENGINE.x}>
          <cylinderGeometry args={[ENGINE.radius, ENGINE.radius * 0.9, ENGINE.length, ROUND]} />
          <meshLambertMaterial color={HULL} />
        </mesh>
        <mesh position-x={ENGINE.x + ENGINE.length / 2} scale={[0.6, 1, 1]}>
          <sphereGeometry args={[ENGINE.radius, ROUND, ROUND / 2]} />
          <meshLambertMaterial color={HULL} />
        </mesh>
        {RIB_IDS.map((rib) => (
          <mesh
            key={rib}
            rotation-y={QUARTER_TURN}
            position-x={ENGINE.x - ENGINE.length / 2 + (rib * ENGINE.length) / (ENGINE.ribs - 1)}
          >
            <torusGeometry args={[ENGINE.radius * 1.01, 0.07, 6, ROUND * 2]} />
            <meshLambertMaterial color={DARK} />
          </mesh>
        ))}
        {/* The nozzle's blue ring, and the fire it pushes. */}
        <mesh rotation-y={QUARTER_TURN} position-x={NOZZLE.x}>
          <circleGeometry args={[NOZZLE.radius, ROUND * 2]} />
          <meshBasicMaterial color={LIGHT} side={DoubleSide} />
        </mesh>
        <group ref={flameRef} position-x={NOZZLE.x}>
          <mesh rotation-z={QUARTER_TURN} position-x={-FLAME.length / 2}>
            <coneGeometry args={[FLAME.radius, FLAME.length, ROUND, 1, true]} />
            <meshBasicMaterial
              color={LIGHT}
              transparent
              opacity={FLAME_OPACITY.outer}
              userData={{ baseOpacity: FLAME_OPACITY.outer }}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation-z={QUARTER_TURN} position-x={(-FLAME.length * FLAME.core) / 2}>
            <coneGeometry args={[FLAME.radius * FLAME.core, FLAME.length * FLAME.core, ROUND, 1]} />
            <meshBasicMaterial
              color={CORE}
              transparent
              opacity={FLAME_OPACITY.core}
              userData={{ baseOpacity: FLAME_OPACITY.core }}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* The hub midway, ringed, its windows lit warm. */}
        <mesh rotation-z={QUARTER_TURN} position-x={HUB.x}>
          <cylinderGeometry args={[HUB.radius, HUB.radius, HUB.length, ROUND]} />
          <meshLambertMaterial color={HULL} />
        </mesh>
        {HUB_RINGS.map((offset) => (
          <mesh key={offset} rotation-y={QUARTER_TURN} position-x={HUB.x - HUB.length / 2 + offset}>
            <torusGeometry args={[HUB.radius * 1.12, 0.12, 6, ROUND * 2]} />
            <meshLambertMaterial color={DARK} />
          </mesh>
        ))}
        <mesh rotation-z={QUARTER_TURN} position-x={HUB.x}>
          <cylinderGeometry args={[HUB.radius * 1.02, HUB.radius * 1.02, 0.3, ROUND]} />
          <meshBasicMaterial color={WARM} />
        </mesh>

        {/* The reactor ring at the nose, its core lit. */}
        <mesh rotation-y={QUARTER_TURN} position-x={REACTOR.x}>
          <torusGeometry args={[REACTOR.radius, REACTOR.tube, 8, ROUND * 2]} />
          <meshLambertMaterial color={HULL} />
        </mesh>
        <mesh position-x={REACTOR.x}>
          <sphereGeometry args={[REACTOR.core, ROUND, ROUND / 2]} />
          <meshBasicMaterial color={WARM} />
        </mesh>

        {/* The three crescent hulls, turning round the spine. */}
        <group ref={hullsRef}>
          {bladeTurns.map((turn) => (
            <group key={turn} rotation-x={turn}>
              <mesh position-z={-BLADE.depth / 2}>
                <extrudeGeometry
                  args={[
                    bladeShape,
                    {
                      depth: BLADE.depth,
                      bevelEnabled: true,
                      bevelThickness: 0.12,
                      bevelSize: 0.1,
                      bevelSegments: 1,
                    },
                  ]}
                />
                <meshLambertMaterial color={HULL} />
              </mesh>
              {LIGHT_SHARES.map((share) => {
                const point = getBladePoint(share);
                return (
                  <mesh
                    key={share}
                    position={[point.x, point.y - BLADE.thickness * 0.45, BLADE.depth / 2 + 0.13]}
                  >
                    <boxGeometry args={[0.32, 0.16, 0.05]} />
                    <meshBasicMaterial color={WARM} />
                  </mesh>
                );
              })}
              {STRUTS.map((strut) => {
                const point = getBladePoint(strut.along);
                const height = point.y - BLADE.thickness / 2;
                return (
                  <mesh key={strut.along} position={[strut.x, height / 2, 0]}>
                    <cylinderGeometry args={[STRUT_RADIUS, STRUT_RADIUS, height, 6]} />
                    <meshLambertMaterial color={DARK} />
                  </mesh>
                );
              })}
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
