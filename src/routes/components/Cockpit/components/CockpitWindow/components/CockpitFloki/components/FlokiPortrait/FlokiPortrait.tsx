import { Canvas } from "@react-three/fiber";

import { PALETTE } from "#/utils/palette";

import type { FlokiStatus } from "../../../../hooks/useFloki";
import { FlokiDog } from "../../../FlokiDog";

// Head and shoulders, a little from below, the way he sits beside the visitor.
const CAMERA = { position: [0.45, 1.58, 3.1], fov: 30, near: 0.1, far: 20 } as const;
const LOOK_AT = [0, 1.6, 0.25] as const;

interface FlokiPortraitProps {
  status: FlokiStatus;
  getLevel: () => number;
  // Called a good boy this many times: his ears perk up each time.
  praiseCount: number;
}

export function FlokiPortrait({ status, getLevel, praiseCount }: FlokiPortraitProps) {
  return (
    <Canvas
      // No tone mapping: palette colors as in styles.css.
      flat
      dpr={[1, 2]}
      camera={CAMERA}
      onCreated={({ camera }) => camera.lookAt(...LOOK_AT)}
      aria-hidden="true"
    >
      <ambientLight intensity={0.9} />
      <directionalLight color={PALETTE.ochre.soft} intensity={2.2} position={[2, 3, 3]} />
      <directionalLight color={PALETTE.sky.soft} intensity={1.6} position={[-3, 2, -2]} />
      <FlokiDog status={status} getLevel={getLevel} praiseCount={praiseCount} />
    </Canvas>
  );
}
