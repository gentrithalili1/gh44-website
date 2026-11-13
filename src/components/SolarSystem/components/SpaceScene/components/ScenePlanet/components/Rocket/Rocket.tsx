import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import { type Group, type Mesh, Shape, Vector2, Vector3 } from "three";

import type { SceneState } from "#/components/SolarSystem/components/SpaceScene/types";
import { ROCKET_HEIGHT } from "#/components/SolarSystem/utils/space";
import { useRocketLaunch } from "#/hooks/useRocketLaunch";
import { PALETTE, SPACE_COLORS } from "#/utils/palette";

import { getRocketOrbit, getRocketPosition } from "./utils/rocketOrbit";

const ROCKET_SEGMENTS = 16;
const BODY_RADIUS = 0.75;
const NOZZLE = { bottomRadius: 0.55, topRadius: 0.4, height: 0.35 };
const BODY_HEIGHT = 2.95;
const NOSE_HEIGHT = ROCKET_HEIGHT - NOZZLE.height - BODY_HEIGHT;
const PORTHOLE = { radius: 0.3, height: NOZZLE.height + BODY_HEIGHT * 0.7 };
const FIN_THICKNESS = 0.14;
const FIN_IDS = [0, 1, 2] as const;
// A fin's side, from where it meets the body (x = 0): it sweeps back and out past the tail.
const FIN_SHAPE = new Shape([
  new Vector2(0, 1.6),
  new Vector2(0.85, 0.3),
  new Vector2(0.85, -0.15),
  new Vector2(0, 0.35),
]);
const FLAME_RADIUS = 0.8;
const FLAME_HEIGHT = 2.4;
const FLAME_FLICKER = 0.25;
const FLAME_FLICKER_SPEED = 40;
const UP = new Vector3(0, 1, 0);
// Below this step (system units) the heading stays as it was.
const MIN_HEADING_STEP = 1e-6;

interface RocketProps {
  planetSize: number;
  sceneStateRef: RefObject<SceneState>;
}

export function Rocket({ planetSize, sceneStateRef }: RocketProps) {
  const rocketLaunch = useRocketLaunch();

  return (
    <>
      {rocketLaunch.status === "asking" ? (
        <group key={rocketLaunch.launchId} position-y={planetSize}>
          <RocketBody />
        </group>
      ) : null}
      {rocketLaunch.orbitingIds.map((id) => (
        <OrbitingRocket key={id} id={id} planetSize={planetSize} sceneStateRef={sceneStateRef} />
      ))}
    </>
  );
}

interface OrbitingRocketProps {
  id: number;
  planetSize: number;
  sceneStateRef: RefObject<SceneState>;
}

function OrbitingRocket({ id, planetSize, sceneStateRef }: OrbitingRocketProps) {
  const groupRef = useRef<Group>(null);
  const flameRef = useRef<Mesh>(null);
  // Seconds since lift-off, and how far round the orbit it has come (radians).
  const flightTimeRef = useRef(0);
  const angleRef = useRef(0);
  const positionRef = useRef(new Vector3());
  const headingRef = useRef(new Vector3());

  const orbit = getRocketOrbit({ id, planetSize });

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const frameStep = sceneStateRef.current.frameStep;
    flightTimeRef.current += frameStep;
    const flight = getRocketPosition({
      orbit,
      planetSize,
      flightTime: flightTimeRef.current,
      angle: angleRef.current,
    });
    angleRef.current += orbit.speed * flight.climb * frameStep;
    const position = positionRef.current.set(flight.x, flight.y, flight.z);
    const heading = headingRef.current.subVectors(position, group.position);
    if (heading.lengthSq() > MIN_HEADING_STEP) {
      group.quaternion.setFromUnitVectors(UP, heading.normalize());
    }
    group.position.copy(position);

    const flame = flameRef.current;
    if (!flame) return;
    flame.visible = flight.climb < 1;
    flame.scale.setY(1 + Math.sin(flightTimeRef.current * FLAME_FLICKER_SPEED) * FLAME_FLICKER);
  });

  return (
    // It leaves from the pad, nose up, then turns its nose along its path.
    <group ref={groupRef} position-y={planetSize}>
      <RocketBody flameRef={flameRef} />
    </group>
  );
}

interface RocketBodyProps {
  flameRef?: RefObject<Mesh | null>;
}

// The rocket points up from its tail at the group's origin; a flying one burns a flame below it.
function RocketBody({ flameRef }: RocketBodyProps) {
  return (
    <>
      <mesh position-y={NOZZLE.height / 2}>
        <cylinderGeometry
          args={[NOZZLE.topRadius, NOZZLE.bottomRadius, NOZZLE.height, ROCKET_SEGMENTS]}
        />
        <meshLambertMaterial color={SPACE_COLORS.rule} />
      </mesh>
      <mesh position-y={NOZZLE.height + BODY_HEIGHT / 2}>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS, BODY_HEIGHT, ROCKET_SEGMENTS]} />
        <meshLambertMaterial color={SPACE_COLORS.foreground} />
      </mesh>
      <mesh position-y={NOZZLE.height + BODY_HEIGHT + NOSE_HEIGHT / 2}>
        <coneGeometry args={[BODY_RADIUS, NOSE_HEIGHT, ROCKET_SEGMENTS]} />
        <meshLambertMaterial color={PALETTE.clay.vivid} />
      </mesh>
      <mesh position={[0, PORTHOLE.height, BODY_RADIUS]}>
        <circleGeometry args={[PORTHOLE.radius, ROCKET_SEGMENTS]} />
        <meshBasicMaterial color={PALETTE.sky.vivid} />
      </mesh>
      {FIN_IDS.map((id) => (
        <group key={id} rotation-y={(id * Math.PI * 2) / FIN_IDS.length}>
          <mesh position={[BODY_RADIUS * 0.9, 0, -FIN_THICKNESS / 2]}>
            <extrudeGeometry args={[FIN_SHAPE, { depth: FIN_THICKNESS, bevelEnabled: false }]} />
            <meshLambertMaterial color={PALETTE.clay.vivid} />
          </mesh>
        </group>
      ))}
      {flameRef ? (
        <mesh ref={flameRef} rotation-x={Math.PI} position-y={-FLAME_HEIGHT / 2}>
          <coneGeometry args={[FLAME_RADIUS, FLAME_HEIGHT, ROCKET_SEGMENTS]} />
          <meshBasicMaterial color={PALETTE.ochre.vivid} />
        </mesh>
      ) : null}
    </>
  );
}
