import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { DoubleSide, type Mesh, SRGBColorSpace } from "three";

import { PALETTE } from "#/utils/palette";

import { getFlagWave } from "./utils/flagWave";

// In system units: a pole standing on top of the moon, and the flag at its top.
const POLE = { height: 4.2, radius: 0.1 } as const;
const FLAG = { width: 3.4, height: 1.8, columns: 16, rows: 8 } as const;
const PIXELS = { width: 285, height: 150 } as const;
// Thirteen stripes, the top one red; the blue field covers the top seven, two fifths across.
const STRIPES = 13;
const FIELD = { stripes: 7, width: 0.4 } as const;
// The stars as dots in the field: rows of 6 and 5 taking turns.
const STAR_ROWS = 9;
const STAR_COLUMNS = 11;
const STAR_RADIUS = 2.3;

// The flag in the palette's red, white and blue.
function drawFlag() {
  const canvas = document.createElement("canvas");
  canvas.width = PIXELS.width;
  canvas.height = PIXELS.height;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  const stripe = PIXELS.height / STRIPES;
  for (let index = 0; index < STRIPES; index++) {
    context.fillStyle = index % 2 === 0 ? PALETTE.rose.soft : PALETTE.neutral.soft;
    context.fillRect(0, index * stripe, PIXELS.width, stripe + 1);
  }
  const field = { width: PIXELS.width * FIELD.width, height: stripe * FIELD.stripes };
  context.fillStyle = PALETTE.sky.vivid;
  context.fillRect(0, 0, field.width, field.height);
  context.fillStyle = PALETTE.neutral.soft;
  for (let row = 0; row < STAR_ROWS; row++) {
    for (let column = row % 2; column < STAR_COLUMNS; column += 2) {
      context.beginPath();
      context.arc(
        ((column + 1) / (STAR_COLUMNS + 1)) * field.width,
        ((row + 1) / (STAR_ROWS + 1)) * field.height,
        STAR_RADIUS,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
  }

  return canvas;
}

interface MoonFlagProps {
  // The moon's radius: the pole stands on its top.
  moonRadius: number;
}

// The flag planted on Earth's moon, waving from its pole. Decorative: no events.
export function MoonFlag({ moonRadius }: MoonFlagProps) {
  const [canvas] = useState(drawFlag);
  const flagRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const geometry = flagRef.current?.geometry;
    if (!geometry) return;
    const position = geometry.getAttribute("position");
    for (let index = 0; index < position.count; index++) {
      const along = position.getX(index) / FLAG.width + 0.5;
      position.setZ(index, getFlagWave({ along, time: clock.elapsedTime }));
    }
    position.needsUpdate = true;
  });

  return (
    <group position-y={moonRadius * 0.92}>
      <mesh position-y={POLE.height / 2}>
        <cylinderGeometry args={[POLE.radius, POLE.radius, POLE.height, 6]} />
        <meshBasicMaterial color={PALETTE.neutral.vivid} transparent />
      </mesh>
      <mesh ref={flagRef} position={[FLAG.width / 2, POLE.height - FLAG.height / 2, 0]}>
        <planeGeometry args={[FLAG.width, FLAG.height, FLAG.columns, FLAG.rows]} />
        <meshBasicMaterial side={DoubleSide} transparent>
          <canvasTexture attach="map" args={[canvas]} colorSpace={SRGBColorSpace} />
        </meshBasicMaterial>
      </mesh>
    </group>
  );
}
