import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef, useState } from "react";
import type { Group } from "three";

import { SYSTEM_SIZE } from "#/components/SolarSystem/utils/space";

import type { SceneState } from "../../types";
import { damp } from "../../utils/sceneMath";
import { ShootingStars } from "./components/ShootingStars";
import { createStarField } from "./utils/starField";
import { STAR_FRAGMENT_SHADER, STAR_VERTEX_SHADER } from "./utils/starShaders";
import { getStarTint, stepStarTint } from "./utils/starTint";

// Zoomed in past this many times, stars draw a little larger.
const ZOOMED_IN = 1.5;
const ZOOMED_IN_SIZE = 1.2;
// While the ship cruises with the cockpit open, the sky turns at this many radians a second:
// space slides by the windshield instead of standing still.
const CRUISE_SPEED = 0.05;
const CRUISE_LAMBDA = 2;

interface StarsProps {
  openPlanetId: string | undefined;
  isCruising: boolean;
  sceneStateRef: RefObject<SceneState>;
}

// Twinkling stars all around the system, far behind it. They take the open planet's color,
// easing there and back, and the sky turns past the cockpit while the ship cruises.
export function Stars({ openPlanetId, isCruising, sceneStateRef }: StarsProps) {
  const [field] = useState(() => createStarField());
  // Passed through the constructor, so the material keeps this uniforms object: the `uniforms`
  // prop copies each uniform, and reassigned values would never reach it.
  const [material] = useState(() => ({
    vertexShader: STAR_VERTEX_SHADER,
    fragmentShader: STAR_FRAGMENT_SHADER,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uSizeBoost: { value: 1 },
      uColor: { value: getStarTint(openPlanetId) },
    },
  }));

  const skyRef = useRef<Group>(null);
  // How much of the cruise turn applies: it eases in and out.
  const cruiseLevelRef = useRef(0);

  const targetTint = getStarTint(openPlanetId);

  useFrame(({ size, viewport, clock }, delta) => {
    const fitZoom = Math.min(size.width, size.height) / SYSTEM_SIZE;
    stepStarTint({ tint: material.uniforms.uColor.value, target: targetTint, delta });
    cruiseLevelRef.current = damp({
      current: cruiseLevelRef.current,
      target: isCruising ? 1 : 0,
      delta,
      lambda: CRUISE_LAMBDA,
    });
    if (skyRef.current) skyRef.current.rotation.y -= cruiseLevelRef.current * CRUISE_SPEED * delta;
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uPixelRatio.value = viewport.dpr;
    material.uniforms.uSizeBoost.value =
      sceneStateRef.current.cameraZoom > fitZoom * ZOOMED_IN ? ZOOMED_IN_SIZE : 1;
  });

  return (
    <>
      <points ref={skyRef} frustumCulled={false} renderOrder={-1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[field.positions, 3]} />
          <bufferAttribute attach="attributes-aDepth" args={[field.depths, 1]} />
          <bufferAttribute attach="attributes-aSize" args={[field.sizes, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[field.phases, 1]} />
          <bufferAttribute attach="attributes-aSpeed" args={[field.speeds, 1]} />
        </bufferGeometry>
        <shaderMaterial args={[material]} transparent depthTest={false} depthWrite={false} />
      </points>
      <ShootingStars tint={material.uniforms.uColor.value} />
    </>
  );
}
