import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import { type Group, type Mesh, Vector3 } from "three";

import type { SceneState } from "#/components/SolarSystem/components/SpaceScene/types";
import { ROCKET_HEIGHT } from "#/components/SolarSystem/utils/space";
import { useRocketLaunch } from "#/hooks/useRocketLaunch";
import { PALETTE, SPACE_COLORS } from "#/utils/palette";

import { getRocketOrbit, getRocketPosition } from "./utils/rocketOrbit";

const ROCKET_RADIUS = 1.4;
const ROCKET_SEGMENTS = 12;
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

// gh44-confirm's rockets: one stands on top of Mars while the panel's dialog asks, and every
// launched one climbs into its own orbit around the planet and stays there.
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

// The cone points up from its tail at the group's origin; a flying one burns a flame below it.
function RocketBody({ flameRef }: RocketBodyProps) {
  return (
    <>
      <mesh position-y={ROCKET_HEIGHT / 2}>
        <coneGeometry args={[ROCKET_RADIUS, ROCKET_HEIGHT, ROCKET_SEGMENTS]} />
        <meshLambertMaterial color={SPACE_COLORS.foreground} />
      </mesh>
      {flameRef ? (
        <mesh ref={flameRef} rotation-x={Math.PI} position-y={-FLAME_HEIGHT / 2}>
          <coneGeometry args={[FLAME_RADIUS, FLAME_HEIGHT, ROCKET_SEGMENTS]} />
          <meshBasicMaterial color={PALETTE.ochre.vivid} />
        </mesh>
      ) : null}
    </>
  );
}
