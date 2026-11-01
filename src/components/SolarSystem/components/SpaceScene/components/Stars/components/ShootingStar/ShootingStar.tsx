import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { type Color, type LineSegments, Vector2 } from "three";

import {
  SHOOTING_STAR_FRAGMENT_SHADER,
  SHOOTING_STAR_VERTEX_SHADER,
} from "../../utils/starShaders";

// About one every 8 seconds; each crosses at this speed (px per second) for about a second.
const SPAWNS_PER_SECOND = 0.12;
const VELOCITY = { x: 540, y: 180 } as const;
const FADE_PER_SECOND = 0.9;
const TAIL_SECONDS = 1 / 6;

type Streak = { x: number; y: number; life: number };

// The streak's two ends: the head (0) and the tail (1).
const STREAK_ENDS = [0, 1];

interface ShootingStarProps {
  // The stars' tint itself, shared so the streak always matches them.
  tint: Color;
}

// Now and then a streak crosses the upper half of the sky.
export function ShootingStar({ tint }: ShootingStarProps) {
  const [ends] = useState(() => ({
    positions: new Float32Array(6),
    tails: new Float32Array(STREAK_ENDS),
  }));
  const lineRef = useRef<LineSegments>(null);
  const [uniforms] = useState(() => ({
    uViewport: { value: new Vector2(1, 1) },
    uLife: { value: 0 },
    uColor: { value: tint },
  }));
  const streakRef = useRef<Streak | null>(null);

  useFrame(({ size }, delta) => {
    if (!streakRef.current && Math.random() < SPAWNS_PER_SECOND * delta) {
      streakRef.current = {
        x: Math.random() * size.width,
        y: Math.random() * size.height * 0.5,
        life: 1,
      };
    }
    const streak = streakRef.current;
    uniforms.uViewport.value.set(size.width, size.height);
    uniforms.uLife.value = Math.max(streak?.life ?? 0, 0);
    if (!streak) return;
    streak.x += VELOCITY.x * delta;
    streak.y += VELOCITY.y * delta;
    streak.life -= FADE_PER_SECOND * delta;
    const position = lineRef.current?.geometry.getAttribute("position");
    if (position) {
      position.setXY(0, streak.x, streak.y);
      position.setXY(1, streak.x - VELOCITY.x * TAIL_SECONDS, streak.y - VELOCITY.y * TAIL_SECONDS);
      position.needsUpdate = true;
    }
    if (streak.life <= 0) streakRef.current = null;
  });

  return (
    <lineSegments ref={lineRef} frustumCulled={false} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[ends.positions, 3]} />
        <bufferAttribute attach="attributes-aTail" args={[ends.tails, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={SHOOTING_STAR_VERTEX_SHADER}
        fragmentShader={SHOOTING_STAR_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </lineSegments>
  );
}
