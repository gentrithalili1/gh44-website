import { Billboard, Html, useCursor } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useNavigate } from "@tanstack/react-router";
import { useContextBridge } from "its-fine";
import { type RefObject, useRef, useState } from "react";
import type { Group } from "three";

import type { PlanetState } from "#/components/SolarSystem/types";
import { getOrbitAngle } from "#/components/SolarSystem/utils/motion";
import { getOrbiters } from "#/components/SolarSystem/utils/orbiters";
import { getRingBands, getUprightRing } from "#/components/SolarSystem/utils/rings";
import { getOrbitPosition, getPlanetState } from "#/components/SolarSystem/utils/space";
import type { SolarPlanet } from "#/utils/planets";
import type { ThemeToolId } from "#/utils/themeTools";

import type { SceneState } from "../../types";
import { setGroupOpacity } from "../../utils/groupOpacity";
import {
  damp,
  FADED_OPACITY,
  WINDSHIELD_OPACITY,
  getOrbitPace,
  isDragRelease,
  toPlanePosition,
} from "../../utils/sceneMath";
import { Orbiters } from "./components/Orbiters";
import { PlanetLabel } from "./components/PlanetLabel";
import { PlanetSurface } from "./components/PlanetSurface";
import { Rings } from "./components/Rings";
import { Rocket } from "./components/Rocket";
import { UprightRing } from "./components/UprightRing";
import type { HoverChange } from "./types";

const BODY_HOVER = "body";
const LABEL_HOVER = "label";

// Labels stay under the panel and the back link.
const LABEL_Z_INDEX_RANGE = [1, 0];

function getPlanetOpacity({
  state,
  isCockpitOpen,
}: {
  state: PlanetState;
  isCockpitOpen: boolean;
}) {
  if (isCockpitOpen) return WINDSHIELD_OPACITY;

  return state === "faded" ? FADED_OPACITY : 1;
}

interface ScenePlanetProps {
  planet: SolarPlanet;
  openPlanetId: string | undefined;
  // The open cockpit steps every planet back.
  isCockpitOpen: boolean;
  sceneStateRef: RefObject<SceneState>;
  labelList: HTMLUListElement;
}

// One planet on its orbit, carrying what says what it holds: surface, moons, satellites, rings
// or the rocket. It moves every frame. A site planet holds still while hovered or open, and opens
// its page on click; a decorative one only passes by, with no label.
export function ScenePlanet({
  planet,
  openPlanetId,
  isCockpitOpen,
  sceneStateRef,
  labelList,
}: ScenePlanetProps) {
  // Hands the router to the label, which drei renders in its own React root.
  const ContextBridge = useContextBridge();
  const navigate = useNavigate();
  const groupRef = useRef<Group>(null);
  // Seconds of orbit: the scene clock, scaled by this planet's own pace.
  const orbitTimeRef = useRef(0);
  // Everything the pointer is over that holds this planet still.
  const [hoverSources, setHoverSources] = useState<ReadonlySet<string>>(() => new Set());
  const opacityRef = useRef(1);

  const state = isCockpitOpen ? "faded" : getPlanetState({ planetId: planet.id, openPlanetId });
  const ringBands = getRingBands(planet);
  const uprightRing = getUprightRing(planet);
  const isSitePlanet = planet.kind === "site";
  const isHovered = hoverSources.size > 0;
  // An open gh44-theme still takes ring band clicks: each opens its app's tab.
  const isRingBandHovered = ringBands.some((band) => hoverSources.has(band.id));
  useCursor(isHovered && (state === "idle" || (state === "current" && isRingBandHovered)));

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const sceneState = sceneStateRef.current;
    orbitTimeRef.current += getOrbitPace({ state, isHovered }) * sceneState.frameStep;
    const angle = getOrbitAngle({ planet, time: orbitTimeRef.current });
    sceneState.planetAngles.set(planet.id, angle);
    group.position.set(
      ...toPlanePosition(getOrbitPosition({ radius: planet.orbit.radius, phase: angle })),
    );
    opacityRef.current = damp({
      current: opacityRef.current,
      target: getPlanetOpacity({ state, isCockpitOpen }),
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
    if (state !== "idle" || planet.kind !== "site") return;
    void navigate({ to: "/$planetId", params: { planetId: planet.id } });
  }

  function handleRingBandClick(app: ThemeToolId) {
    if (state === "faded" || planet.kind !== "site") return;
    // On the open planet a band switches tabs, like the tabs themselves: no new history entry.
    void navigate({
      to: "/$planetId",
      params: { planetId: planet.id },
      search: { app },
      replace: state === "current",
    });
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    if (isDragRelease(event.delta)) return;
    handleOpen();
  }

  return (
    <group ref={groupRef}>
      <PlanetSurface
        planet={planet}
        sceneStateRef={sceneStateRef}
        onPointerOver={isSitePlanet ? handlePointerOver : undefined}
        onPointerOut={isSitePlanet ? handlePointerOut : undefined}
        onClick={isSitePlanet ? handleClick : undefined}
      />
      {uprightRing ? <UprightRing ring={uprightRing} /> : null}
      <Orbiters
        orbiters={getOrbiters(planet)}
        isPlanetOpen={state === "current"}
        onHoverChange={handleHoverChange}
        onPlanetClick={handleOpen}
        sceneStateRef={sceneStateRef}
      />
      <Rings
        bands={ringBands}
        onHoverChange={handleHoverChange}
        onBandClick={handleRingBandClick}
      />
      {planet.features.hasRocket ? (
        <Rocket planetSize={planet.size} sceneStateRef={sceneStateRef} />
      ) : null}
      {/* The label hangs under the planet as seen: it turns to face the camera. */}
      {planet.kind === "site" ? (
        <Billboard>
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
        </Billboard>
      ) : null}
    </group>
  );
}
