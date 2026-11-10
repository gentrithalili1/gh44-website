import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { BackSide, type Color, type ShaderMaterial } from "three";

import { AIR_FRAGMENT_SHADER, SURFACE_VERTEX_SHADER } from "../../utils/surfaceShaders";

const SHELL_SEGMENTS = 48;
// The air reaches this many planet radii from the center.
const SHELL_SCALE = 1.22;
const AIR_OPACITY = 0.55;

interface AtmosphereProps {
  radius: number;
  // sRGB as written: the shader outputs it as it is.
  color: Color;
  // 0 to 1: how thick the planet's air is.
  strength: number;
}

// The glow of air around a planet's edge, brightest toward the sun. Decorative: no events.
export function Atmosphere({ radius, color, strength }: AtmosphereProps) {
  const [material] = useState(() => ({
    vertexShader: SURFACE_VERTEX_SHADER,
    fragmentShader: AIR_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: color },
      uRadius: { value: radius },
      uShellRadius: { value: radius * SHELL_SCALE },
      uStrength: { value: strength * AIR_OPACITY },
      uOpacity: { value: 1 },
    },
  }));
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame(() => {
    // The planet's fade sets the material's opacity; the shader reads it here.
    if (materialRef.current) material.uniforms.uOpacity.value = materialRef.current.opacity;
  });

  return (
    <mesh>
      <sphereGeometry args={[radius * SHELL_SCALE, SHELL_SEGMENTS, SHELL_SEGMENTS / 2]} />
      <shaderMaterial
        ref={materialRef}
        args={[material]}
        side={BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
