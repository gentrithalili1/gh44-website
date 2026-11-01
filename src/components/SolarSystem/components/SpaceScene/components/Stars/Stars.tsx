import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Vector2 } from "three";

import { SYSTEM_SIZE } from "#/components/SolarSystem/utils/space";

import { damp } from "../../utils/sceneMath";
import { ShootingStars } from "./components/ShootingStars";
import { createStarField } from "./utils/starField";
import { STAR_FRAGMENT_SHADER, STAR_VERTEX_SHADER } from "./utils/starShaders";
import { getStarTint, stepStarTint } from "./utils/starTint";

// How far the nearest stars drift per pixel the camera moves; farther layers drift less.
const PARALLAX = 0.02;
// Zoomed in past this many times, stars draw a little larger.
const ZOOMED_IN = 1.5;
const ZOOMED_IN_SIZE = 1.2;
// While the ship cruises with the cockpit open, the stars stream past this much faster: space
// slides by the windshield instead of standing still.
const CRUISE_PARALLAX = 0.35;
const CRUISE_LAMBDA = 2;

interface StarsProps {
  openPlanetId: string | undefined;
  isCruising: boolean;
}

// Three layers of twinkling stars behind the system. They drift with the camera at their depth
// and take the open planet's color, easing there and back.
export function Stars({ openPlanetId, isCruising }: StarsProps) {
  const [field] = useState(() =>
    createStarField({ width: window.innerWidth, height: window.innerHeight }),
  );
  // Passed through the constructor, so the material keeps this uniforms object: the `uniforms`
  // prop copies each uniform, and reassigned values would never reach it.
  const [material] = useState(() => ({
    vertexShader: STAR_VERTEX_SHADER,
    fragmentShader: STAR_FRAGMENT_SHADER,
    uniforms: {
      uViewport: { value: new Vector2(1, 1) },
      uOffset: { value: new Vector2(0, 0) },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uSizeBoost: { value: 1 },
      uColor: { value: getStarTint(openPlanetId) },
    },
  }));

  // How much of the cruise drift applies (eases in and out), the drift it has added up in screen
  // pixels, and where the camera was last frame.
  const cruiseRef = useRef({ level: 0, x: 0, y: 0, cameraX: 0, cameraY: 0 });

  const targetTint = getStarTint(openPlanetId);

  useFrame(({ camera, size, viewport, clock }, delta) => {
    const fitZoom = Math.min(size.width, size.height) / SYSTEM_SIZE;
    stepStarTint({ tint: material.uniforms.uColor.value, target: targetTint, delta });
    material.uniforms.uViewport.value.set(size.width, size.height);
    const cruise = cruiseRef.current;
    cruise.level = damp({
      current: cruise.level,
      target: isCruising ? 1 : 0,
      delta,
      lambda: CRUISE_LAMBDA,
    });
    const cruiseDrift = cruise.level * CRUISE_PARALLAX * camera.zoom;
    cruise.x += (camera.position.x - cruise.cameraX) * cruiseDrift;
    cruise.y -= (camera.position.y - cruise.cameraY) * cruiseDrift;
    cruise.cameraX = camera.position.x;
    cruise.cameraY = camera.position.y;
    // The camera's position in screen pixels; `y` grows downward on screen.
    material.uniforms.uOffset.value.set(
      camera.position.x * camera.zoom * PARALLAX + cruise.x,
      -camera.position.y * camera.zoom * PARALLAX + cruise.y,
    );
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uPixelRatio.value = viewport.dpr;
    material.uniforms.uSizeBoost.value = camera.zoom > fitZoom * ZOOMED_IN ? ZOOMED_IN_SIZE : 1;
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
        <shaderMaterial args={[material]} transparent depthTest={false} depthWrite={false} />
      </points>
      <ShootingStars tint={material.uniforms.uColor.value} />
    </>
  );
}
