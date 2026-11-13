import { useState } from "react";
import {
  BackSide,
  type Color,
  DataTexture,
  DataUtils,
  HalfFloatType,
  LinearFilter,
  RepeatWrapping,
  RGBAFormat,
} from "three";

import { STAR_DISTANCE } from "../../utils/starField";
import { NEBULA_FRAGMENT_SHADER, NEBULA_VERTEX_SHADER } from "../../utils/starShaders";
import { createNebulaMap, NEBULA_MAP_HEIGHT, NEBULA_MAP_WIDTH } from "./utils/nebulaMap";

// Just inside the stars, so they draw over it.
const SHELL_RADIUS = STAR_DISTANCE * 0.99;
const SHELL_SEGMENTS = 48;

function createNebulaTexture() {
  // Half floats: finer steps than bytes, and every WebGL2 device blends between them.
  const pixels = Uint16Array.from(createNebulaMap(), (value) => DataUtils.toHalfFloat(value));
  const texture = new DataTexture(
    pixels,
    NEBULA_MAP_WIDTH,
    NEBULA_MAP_HEIGHT,
    RGBAFormat,
    HalfFloatType,
  );
  texture.wrapS = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

interface NebulaProps {
  // The stars' tint; it changes in place.
  tint: Color;
}

export function Nebula({ tint }: NebulaProps) {
  // Passed through the constructor, so the material keeps this uniforms object.
  const [material] = useState(() => ({
    vertexShader: NEBULA_VERTEX_SHADER,
    fragmentShader: NEBULA_FRAGMENT_SHADER,
    uniforms: { uMap: { value: createNebulaTexture() }, uColor: { value: tint } },
  }));

  return (
    <mesh frustumCulled={false} renderOrder={-2}>
      <sphereGeometry args={[SHELL_RADIUS, SHELL_SEGMENTS, SHELL_SEGMENTS / 2]} />
      <shaderMaterial
        args={[material]}
        side={BackSide}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
