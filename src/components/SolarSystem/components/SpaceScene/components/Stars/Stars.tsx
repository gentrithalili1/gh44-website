import { useFrame } from "@react-three/fiber";
import { useState } from "react";
import { Vector2 } from "three";

import { SYSTEM_SIZE } from "#/components/SolarSystem/utils/space";

import { ShootingStar } from "./components/ShootingStar";
import { createStarField } from "./utils/starField";
import { STAR_FRAGMENT_SHADER, STAR_VERTEX_SHADER } from "./utils/starShaders";
import { getStarTint, stepStarTint } from "./utils/starTint";

// How far the nearest stars drift per pixel the camera moves; farther layers drift less.
const PARALLAX = 0.02;
// Zoomed in past this many times, stars draw a little larger.
const ZOOMED_IN = 1.5;
const ZOOMED_IN_SIZE = 1.2;

interface StarsProps {
  openPlanetId: string | undefined;
}

// Three layers of twinkling stars behind the system. They drift with the camera at their depth
// and take the open planet's color, easing there and back.
export function Stars({ openPlanetId }: StarsProps) {
  const [field] = useState(() =>
    createStarField({ width: window.innerWidth, height: window.innerHeight }),
  );
  const [uniforms] = useState(() => ({
    uViewport: { value: new Vector2(1, 1) },
    uOffset: { value: new Vector2(0, 0) },
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uSizeBoost: { value: 1 },
    uColor: { value: getStarTint(openPlanetId) },
  }));

  const targetTint = getStarTint(openPlanetId);

  useFrame(({ camera, size, viewport, clock }, delta) => {
    const fitZoom = Math.min(size.width, size.height) / SYSTEM_SIZE;
    stepStarTint({ tint: uniforms.uColor.value, target: targetTint, delta });
    uniforms.uViewport.value.set(size.width, size.height);
    // The camera's position in screen pixels; `y` grows downward on screen.
    uniforms.uOffset.value.set(
      camera.position.x * camera.zoom * PARALLAX,
      -camera.position.y * camera.zoom * PARALLAX,
    );
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uPixelRatio.value = viewport.dpr;
    uniforms.uSizeBoost.value = camera.zoom > fitZoom * ZOOMED_IN ? ZOOMED_IN_SIZE : 1;
  });

  return (
    <>
      <points frustumCulled={false} renderOrder={-1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[field.positions, 3]} />
          <bufferAttribute attach="attributes-aDepth" args={[field.depths, 1]} />
          <bufferAttribute attach="attributes-aSize" args={[field.sizes, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[field.phases, 1]} />
          <bufferAttribute attach="attributes-aSpeed" args={[field.speeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={STAR_VERTEX_SHADER}
          fragmentShader={STAR_FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </points>
      <ShootingStar tint={uniforms.uColor.value} />
    </>
  );
}
