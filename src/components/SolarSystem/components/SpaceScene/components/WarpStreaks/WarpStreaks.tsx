import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef, useState } from "react";
import { Color, DoubleSide, LinearSRGBColorSpace, type Mesh } from "three";

import { PALETTE } from "#/utils/palette";

import type { SceneState } from "../../types";
import { getSceneWarp } from "../../utils/blackHole";
import { createWarpField } from "./utils/warpField";
import { WARP_FRAGMENT_SHADER, WARP_VERTEX_SHADER } from "./utils/warpShaders";

interface WarpStreaksProps {
  sceneStateRef: RefObject<SceneState>;
}

// The jump of a launch: stars stretch into streaks that rush past the camera, for as long as
// the scene's warp lasts. Hidden, and not drawn, the rest of the time.
export function WarpStreaks({ sceneStateRef }: WarpStreaksProps) {
  const [field] = useState(() => createWarpField(Math.random));
  const [material] = useState(() => ({
    vertexShader: WARP_VERTEX_SHADER,
    fragmentShader: WARP_FRAGMENT_SHADER,
    uniforms: {
      uTime: { value: 0 },
      uWarp: { value: 0 },
      // sRGB as written: the shader outputs it as it is.
      uColor: { value: new Color().setStyle(PALETTE.neutral.soft, LinearSRGBColorSpace) },
    },
  }));
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const warp = getSceneWarp(sceneStateRef.current);
    if (meshRef.current) meshRef.current.visible = warp > 0;
    material.uniforms.uWarp.value = warp;
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} visible={false} frustumCulled={false} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="index" args={[field.triangles, 1]} />
        <bufferAttribute attach="attributes-position" args={[field.positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[field.seeds, 4]} />
        <bufferAttribute attach="attributes-aCorner" args={[field.corners, 2]} />
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
