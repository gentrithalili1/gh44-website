import type { Shape } from "three";

import type { Shade, SurfaceColor } from "#/components/SolarSystem/types";
import { getSurfaceHex } from "#/components/SolarSystem/utils/surfaceColor";

import { getBodyStencilClip } from "../../utils/bodyStencil";

// Just above the body, so the surface draws on it.
const SURFACE_DEPTH = 0.5;

interface PlanetSurfaceMeshProps {
  outline: Shape;
  color: SurfaceColor;
  shade: Shade;
  opacity: number;
  stencilRef: number;
}

export function PlanetSurfaceMesh({
  outline,
  color,
  shade,
  opacity,
  stencilRef,
}: PlanetSurfaceMeshProps) {
  return (
    <mesh position-z={SURFACE_DEPTH}>
      <shapeGeometry args={[outline]} />
      <meshBasicMaterial
        {...getBodyStencilClip(stencilRef)}
        color={getSurfaceHex({ color, shade })}
        transparent
        opacity={opacity}
        userData={{ baseOpacity: opacity }}
      />
    </mesh>
  );
}
