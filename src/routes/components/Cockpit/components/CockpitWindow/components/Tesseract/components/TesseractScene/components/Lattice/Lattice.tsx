import { useFrame } from "@react-three/fiber";
import { useState } from "react";
import { Color, LinearSRGBColorSpace } from "three";

import { PALETTE, SPACE_COLORS } from "#/utils/palette";

import {
  BEAM,
  type BeamAxis,
  getLatticeBeams,
  LATTICE_TILT,
  type Sightline,
} from "./utils/latticeBeams";
import { BEAM_FRAGMENT_SHADER, BEAM_VERTEX_SHADER } from "./utils/latticeShaders";

const QUARTER_TURN = Math.PI / 2;
// A beam is built along x; these turn it to run along y or z.
const AXIS_TURNS: Record<BeamAxis, [number, number, number]> = {
  x: [0, 0, 0],
  y: [0, 0, QUARTER_TURN],
  z: [0, QUARTER_TURN, 0],
};

// sRGB as written: the shader outputs it as it is.
function toShaderColor(hex: string) {
  return new Color().setStyle(hex, LinearSRGBColorSpace);
}

interface LatticeProps {
  // The camera's view of Floki and the shelf: no beam crosses it.
  sightline: Sightline;
}

// The tesseract's lattice: beams of streaked light crossing in three directions on the slant,
// fading into the dark. Decorative: no events.
export function Lattice({ sightline }: LatticeProps) {
  const [beams] = useState(() => getLatticeBeams(sightline));
  const [material] = useState(() => ({
    vertexShader: BEAM_VERTEX_SHADER,
    fragmentShader: BEAM_FRAGMENT_SHADER,
    uniforms: {
      uDark: { value: toShaderColor(SPACE_COLORS.background).multiplyScalar(0.35) },
      uWarm: { value: toShaderColor(PALETTE.ochre.soft) },
      uCool: { value: toShaderColor(PALETTE.clay.soft).multiplyScalar(0.55) },
      uBright: {
        value: toShaderColor(PALETTE.ochre.soft).lerp(toShaderColor(PALETTE.neutral.soft), 0.6),
      },
      uTime: { value: 0 },
    },
  }));

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <group rotation={[...LATTICE_TILT]}>
      {beams.map((beam) => (
        <mesh key={beam.id} position={beam.position} rotation={AXIS_TURNS[beam.axis]}>
          <boxGeometry args={[BEAM.length, BEAM.thickness, BEAM.thickness]} />
          <shaderMaterial args={[material]} />
        </mesh>
      ))}
    </group>
  );
}
