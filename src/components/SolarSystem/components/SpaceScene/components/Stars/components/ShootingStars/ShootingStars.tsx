import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { type Color, DoubleSide, type Mesh, Vector2 } from "three";

import { MAX_FRAME_STEP } from "../../../../utils/sceneMath";
import {
  SHOOTING_STAR_FRAGMENT_SHADER,
  SHOOTING_STAR_VERTEX_SHADER,
} from "../../utils/starShaders";
import {
  createMeteors,
  isInShower,
  launchShower,
  launchSingle,
  METEOR_OUTLINE_SIZE,
  METEOR_SLOTS,
  SHOWER_INTERVAL,
  SINGLE_INTERVAL,
  stepMeteor,
  writeMeteorOutline,
} from "./utils/meteors";

// Each meteor's four corners: the head's two edges (tail 0) and the tail (tail 1), drawn as two
// triangles.
const CORNERS = 4;
const CORNER_TAILS = [0, 0, 1, 1];
const CORNER_TRIANGLES = [0, 1, 2, 1, 3, 2];

function createBuffers() {
  return {
    positions: new Float32Array(METEOR_SLOTS * METEOR_OUTLINE_SIZE),
    tails: new Float32Array(Array.from({ length: METEOR_SLOTS }, () => CORNER_TAILS).flat()),
    lives: new Float32Array(METEOR_SLOTS * CORNERS),
    triangles: new Uint16Array(
      Array.from({ length: METEOR_SLOTS }, (_, slot) =>
        CORNER_TRIANGLES.map((corner) => slot * CORNERS + corner),
      ).flat(),
    ),
  };
}

interface ShootingStarsProps {
  // The stars' tint itself, shared so the streaks always match them.
  tint: Color;
}

// A shooting star crosses the upper sky every 5 seconds, and every 10 a short meteor shower
// streams out of one radiant. One mesh draws them all, reusing its buffers every frame.
export function ShootingStars({ tint }: ShootingStarsProps) {
  const [buffers] = useState(createBuffers);
  const [meteors] = useState(createMeteors);
  // Passed through the constructor, so the material keeps this uniforms object: the `uniforms`
  // prop copies each uniform, and reassigned values would never reach it.
  const [material] = useState(() => ({
    vertexShader: SHOOTING_STAR_VERTEX_SHADER,
    fragmentShader: SHOOTING_STAR_FRAGMENT_SHADER,
    uniforms: { uViewport: { value: new Vector2(1, 1) }, uColor: { value: tint } },
  }));
  const meshRef = useRef<Mesh>(null);
  // Seconds since the sky started, and when the next single and shower are due.
  const elapsedRef = useRef(0);
  const nextSingleRef = useRef(SINGLE_INTERVAL);
  const nextShowerRef = useRef(SHOWER_INTERVAL);
  // Whether any meteor is in flight or still has its fade-out to upload.
  const isSkyActiveRef = useRef(false);

  useFrame(({ size }, frameDelta) => {
    const geometry = meshRef.current?.geometry;
    if (!geometry) return;
    const delta = Math.min(frameDelta, MAX_FRAME_STEP);
    elapsedRef.current += delta;
    if (elapsedRef.current >= nextShowerRef.current) {
      launchShower({ meteors, viewport: size, random: Math.random });
      isSkyActiveRef.current = true;
      nextShowerRef.current += SHOWER_INTERVAL;
    }
    if (elapsedRef.current >= nextSingleRef.current) {
      const [single] = meteors;
      if (single && !isInShower(nextSingleRef.current)) {
        launchSingle({ meteor: single, viewport: size, random: Math.random });
        isSkyActiveRef.current = true;
      }
      nextSingleRef.current += SINGLE_INTERVAL;
    }
    material.uniforms.uViewport.value.set(size.width, size.height);

    // Nothing to upload while every meteor is gone: the last frame already wrote them hidden.
    if (!isSkyActiveRef.current) return;
    let isAnyAlive = false;
    for (let slot = 0; slot < meteors.length; slot++) {
      const meteor = meteors[slot];
      if (!meteor) continue;
      stepMeteor({ meteor, delta });
      writeMeteorOutline({ meteor, positions: buffers.positions, slot });
      // A meteor waiting its turn stays hidden.
      buffers.lives.fill(meteor.delay > 0 ? 0 : meteor.life, slot * CORNERS, (slot + 1) * CORNERS);
      if (meteor.life > 0) isAnyAlive = true;
    }
    isSkyActiveRef.current = isAnyAlive;
    geometry.getAttribute("position").needsUpdate = true;
    geometry.getAttribute("aLife").needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="index" args={[buffers.triangles, 1]} />
        <bufferAttribute attach="attributes-position" args={[buffers.positions, 3]} />
        <bufferAttribute attach="attributes-aTail" args={[buffers.tails, 1]} />
        <bufferAttribute attach="attributes-aLife" args={[buffers.lives, 1]} />
      </bufferGeometry>
      <shaderMaterial
        args={[material]}
        side={DoubleSide}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
