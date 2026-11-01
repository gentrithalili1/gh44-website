import type { Shape } from "three";

import type { Shade } from "#/components/SolarSystem/types";
import { PALETTE, type PaletteColor } from "#/utils/palette";

// Just above the body, so the surface draws on it.
const SURFACE_DEPTH = 0.5;

interface PlanetSurfaceMeshProps {
  outline: Shape;
  color: PaletteColor;
  shade: Shade;
  opacity: number;
}

export function PlanetSurfaceMesh({ outline, color, shade, opacity }: PlanetSurfaceMeshProps) {
  return (
    <mesh position-z={SURFACE_DEPTH}>
      <shapeGeometry args={[outline]} />
      <meshBasicMaterial
        color={PALETTE[color][shade]}
        transparent
        opacity={opacity}
        userData={{ baseOpacity: opacity }}
      />
    </mesh>
  );
}
