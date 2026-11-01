import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef, useState } from "react";
import type { Group } from "three";

import { getSpinCopyOffsets, getSpinWidth } from "#/components/SolarSystem/utils/motion";
import { getSurfaceShapes } from "#/components/SolarSystem/utils/surface";
import type { PlanetBody } from "#/utils/planets";

import type { SceneState } from "../../../../types";
import { createSurfaceOutline } from "../../utils/sceneGeometry";
import { PlanetSurfaceMesh } from "./PlanetSurface.elements";

interface PlanetSurfaceProps {
  planet: PlanetBody;
  sceneStateRef: RefObject<SceneState>;
  // The planet's own stencil ref: its features show only on its body.
  stencilRef: number;
}

// What is drawn on a planet's disc. Bands stay still; land and storms slide across as the planet
// turns, wrapping around like a globe seen from above: two copies, never both on the disc.
export function PlanetSurface({ planet, sceneStateRef, stencilRef }: PlanetSurfaceProps) {
  const [shapes] = useState(() =>
    getSurfaceShapes(planet).map((shape) => ({ shape, outline: createSurfaceOutline(shape) })),
  );
  const [spinWidth] = useState(() => getSpinWidth(planet));
  const leadRef = useRef<Group>(null);
  const trailRef = useRef<Group>(null);
  // Seconds of spin. It runs on the scene clock alone: hovering or opening the planet stops its
  // orbit, not its turning.
  const spinTimeRef = useRef(0);

  const bands = shapes.filter(({ shape }) => !shape.shouldSpin);
  const features = shapes.filter(({ shape }) => shape.shouldSpin);

  useFrame(() => {
    const lead = leadRef.current;
    const trail = trailRef.current;
    if (!lead || !trail) return;
    spinTimeRef.current += sceneStateRef.current.frameStep;
    const [leadOffset, trailOffset] = getSpinCopyOffsets({
      planet,
      time: spinTimeRef.current,
      spinWidth,
    });
    lead.position.x = leadOffset;
    trail.position.x = trailOffset;
  });

  function renderMeshes(entries: typeof shapes) {
    return entries.map(({ shape, outline }) => (
      <PlanetSurfaceMesh
        key={shape.id}
        outline={outline}
        color={shape.color}
        shade={shape.shade}
        opacity={shape.opacity}
        stencilRef={stencilRef}
      />
    ));
  }

  const featureMeshes = renderMeshes(features);

  return (
    <>
      {renderMeshes(bands)}
      {features.length > 0 ? (
        <>
          <group ref={leadRef}>{featureMeshes}</group>
          <group ref={trailRef}>{featureMeshes}</group>
        </>
      ) : null}
    </>
  );
}
