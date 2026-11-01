import { Html, useCursor } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useNavigate } from "@tanstack/react-router";
import { useContextBridge } from "its-fine";
import { type RefObject, useRef, useState } from "react";
import type { Group } from "three";

import { getOrbiters } from "#/components/SolarSystem/utils/orbiters";
import { getRingBands } from "#/components/SolarSystem/utils/rings";
import {
  getOrbitPosition,
  getOrbitSpeed,
  getPlanetState,
} from "#/components/SolarSystem/utils/space";
import { getSurfaceShapes } from "#/components/SolarSystem/utils/surface";
import { PALETTE } from "#/utils/palette";
import type { Planet } from "#/utils/planets";

import type { SceneState } from "../../types";
import { setGroupOpacity } from "../../utils/groupOpacity";
import {
  damp,
  FADED_OPACITY,
  getOrbitPace,
  MAX_FRAME_STEP,
  toScenePosition,
} from "../../utils/sceneMath";
import { Orbiters } from "./components/Orbiters";
import { PlanetLabel } from "./components/PlanetLabel";
import { Rings } from "./components/Rings";
import { Rocket } from "./components/Rocket";
import { PlanetSurfaceMesh } from "./ScenePlanet.elements";
import type { HoverChange } from "./types";
import { createSurfaceOutline } from "./utils/sceneGeometry";

const BODY_HOVER = "body";
const LABEL_HOVER = "label";

const CIRCLE_SEGMENTS = 64;
// Labels stay under the panel and the back link.
const LABEL_Z_INDEX_RANGE = [1, 0];

interface ScenePlanetProps {
  planet: Planet;
  openPlanetId: string | undefined;
  sceneStateRef: RefObject<SceneState>;
  labelList: HTMLUListElement;
}

// One planet on its orbit, carrying what says what it holds: surface, moons, satellites, rings
// or the rocket. It moves every frame, holds still while hovered or open, and opens its page on
// click.
export function ScenePlanet({ planet, openPlanetId, sceneStateRef, labelList }: ScenePlanetProps) {
  // Hands the router to the label, which drei renders in its own React root.
  const ContextBridge = useContextBridge();
  const navigate = useNavigate();
  const groupRef = useRef<Group>(null);
  const angleRef = useRef<number>(planet.orbit.phase);
  // Everything the pointer is over that holds this planet still.
  const [hoverSources, setHoverSources] = useState<ReadonlySet<string>>(() => new Set());
  const opacityRef = useRef(1);
  const [surface] = useState(() =>
    getSurfaceShapes(planet).map((shape) => ({ shape, outline: createSurfaceOutline(shape) })),
  );

  const state = getPlanetState({ planetId: planet.id, openPlanetId });
  const speed = getOrbitSpeed(planet.orbit.radius);
  const isHovered = hoverSources.size > 0;
  useCursor(isHovered && state === "idle");

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const step = Math.min(delta, MAX_FRAME_STEP);
    angleRef.current += speed * getOrbitPace({ state, isHovered }) * step;
    sceneStateRef.current.planetAngles.set(planet.id, angleRef.current);
    group.position.set(
      ...toScenePosition(
        getOrbitPosition({ radius: planet.orbit.radius, phase: angleRef.current }),
      ),
    );
    opacityRef.current = damp({
      current: opacityRef.current,
      target: state === "faded" ? FADED_OPACITY : 1,
      delta,
    });
    setGroupOpacity({ group, opacity: opacityRef.current });
  });

  function handleHoverChange({ source, isHovered: isSourceHovered }: HoverChange) {
    setHoverSources((sources) => {
      const next = new Set(sources);
      if (isSourceHovered) next.add(source);
      else next.delete(source);
      return next;
    });
  }

  function handleLabelHoverChange(isLabelHovered: boolean) {
    handleHoverChange({ source: LABEL_HOVER, isHovered: isLabelHovered });
  }

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    handleHoverChange({ source: BODY_HOVER, isHovered: true });
  }

  function handlePointerOut() {
    handleHoverChange({ source: BODY_HOVER, isHovered: false });
  }

  function handleOpen() {
    if (state !== "idle") return;
    void navigate({ to: "/$planetId", params: { planetId: planet.id } });
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    handleOpen();
  }

  return (
    <group ref={groupRef}>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
        <circleGeometry args={[planet.size, CIRCLE_SEGMENTS]} />
        <meshBasicMaterial color={PALETTE[planet.color].soft} />
      </mesh>
      {surface.map(({ shape, outline }) => (
        <PlanetSurfaceMesh
          key={shape.id}
          outline={outline}
          color={shape.color}
          shade={shape.shade}
          opacity={shape.opacity}
        />
      ))}
      <Orbiters
        orbiters={getOrbiters(planet)}
        isPlanetOpen={state === "current"}
        onHoverChange={handleHoverChange}
        onPlanetClick={handleOpen}
      />
      <Rings
        bands={getRingBands(planet)}
        onHoverChange={handleHoverChange}
        onPlanetClick={handleOpen}
      />
      {planet.features.hasRocket ? <Rocket planetSize={planet.size} /> : null}
      <Html
        as="li"
        portal={{ current: labelList }}
        position={[0, -planet.size, 0]}
        zIndexRange={LABEL_Z_INDEX_RANGE}
        pointerEvents="none"
      >
        <ContextBridge>
          <PlanetLabel planet={planet} state={state} onHoverChange={handleLabelHoverChange} />
        </ContextBridge>
      </Html>
    </group>
  );
}
