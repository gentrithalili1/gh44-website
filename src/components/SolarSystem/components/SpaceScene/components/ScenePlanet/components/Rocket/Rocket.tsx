import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import type { Group, Mesh } from "three";

import type { SceneState } from "#/components/SolarSystem/components/SpaceScene/types";
import { ROCKET_HEIGHT } from "#/components/SolarSystem/utils/space";
import { isRocketOnStage, useRocketLaunch } from "#/hooks/useRocketLaunch";
import { PALETTE, SPACE_COLORS } from "#/utils/palette";

const ROCKET_RADIUS = 1.4;
const ROCKET_SEGMENTS = 12;
const FLAME_RADIUS = 0.8;
const FLAME_HEIGHT = 2.4;
// The lift-off: from the pad to far out of the frame, faster and faster.
const LIFT_OFF_SECONDS = 2.6;
const LIFT_OFF_DISTANCE = 160;
const FLAME_FLICKER = 0.25;
const FLAME_FLICKER_SPEED = 40;

interface RocketProps {
  planetSize: number;
  sceneStateRef: RefObject<SceneState>;
}

// gh44-confirm's rocket: it stands on top of Mars while the panel's dialog asks, and lifts off
// the planet on launch. A new rocket stands there for every launch.
export function Rocket({ planetSize, sceneStateRef }: RocketProps) {
  const rocketLaunch = useRocketLaunch();

  if (!isRocketOnStage(rocketLaunch.status)) return null;

  return (
    <LaunchingRocket
      key={rocketLaunch.launchId}
      planetSize={planetSize}
      isLaunched={rocketLaunch.status === "launched"}
      sceneStateRef={sceneStateRef}
    />
  );
}

interface LaunchingRocketProps {
  planetSize: number;
  isLaunched: boolean;
  sceneStateRef: RefObject<SceneState>;
}

function LaunchingRocket({ planetSize, isLaunched, sceneStateRef }: LaunchingRocketProps) {
  const groupRef = useRef<Group>(null);
  const flameRef = useRef<Mesh>(null);
  // Seconds since lift-off.
  const flightTimeRef = useRef(0);

  useFrame(() => {
    const group = groupRef.current;
    if (!group || !isLaunched) return;
    flightTimeRef.current += sceneStateRef.current.frameStep;
    const progress = Math.min(1, flightTimeRef.current / LIFT_OFF_SECONDS);
    group.position.y = planetSize + LIFT_OFF_DISTANCE * progress ** 2;
    group.visible = progress < 1;
    flameRef.current?.scale.setY(
      1 + Math.sin(flightTimeRef.current * FLAME_FLICKER_SPEED) * FLAME_FLICKER,
    );
  });

  return (
    // The cone points up from its tail on the planet's top.
    <group ref={groupRef} position-y={planetSize}>
      <mesh position-y={ROCKET_HEIGHT / 2}>
        <coneGeometry args={[ROCKET_RADIUS, ROCKET_HEIGHT, ROCKET_SEGMENTS]} />
        <meshLambertMaterial color={SPACE_COLORS.foreground} />
      </mesh>
      {isLaunched ? (
        <mesh ref={flameRef} rotation-x={Math.PI} position-y={-FLAME_HEIGHT / 2}>
          <coneGeometry args={[FLAME_RADIUS, FLAME_HEIGHT, ROCKET_SEGMENTS]} />
          <meshBasicMaterial color={PALETTE.ochre.vivid} />
        </mesh>
      ) : null}
    </group>
  );
}
