import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Color, DoubleSide, LinearSRGBColorSpace, type ShaderMaterial } from "three";

import type { RingBand } from "#/components/SolarSystem/utils/rings";
import { PALETTE } from "#/utils/palette";

import { RING_FRAGMENT_SHADER, RING_VERTEX_SHADER } from "../../utils/ringShaders";

const RING_SEGMENTS = 128;

interface RingBandMeshProps {
  band: RingBand;
  planetSize: number;
  onHoverChange: (isHovered: boolean) => void;
}

export function RingBandMesh({ band, planetSize, onHoverChange }: RingBandMeshProps) {
  // Passed through the constructor, so the material keeps this uniforms object.
  const [material] = useState(() => ({
    vertexShader: RING_VERTEX_SHADER,
    fragmentShader: RING_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: new Color().setStyle(PALETTE[band.color].soft, LinearSRGBColorSpace) },
      uPlanetRadius: { value: planetSize },
      uOpacity: { value: 1 },
    },
  }));
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame(() => {
    // The planet's fade sets the material's opacity; the shader reads it here.
    if (materialRef.current) material.uniforms.uOpacity.value = materialRef.current.opacity;
  });

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    onHoverChange(true);
  }

  function handlePointerOut() {
    onHoverChange(false);
  }

  return (
    <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <ringGeometry args={[band.innerRadius, band.outerRadius, RING_SEGMENTS]} />
      <shaderMaterial ref={materialRef} args={[material]} side={DoubleSide} transparent />
    </mesh>
  );
}
