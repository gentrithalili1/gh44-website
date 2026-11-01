import { Canvas } from "@react-three/fiber";
import { useRef, useState } from "react";

import { messages } from "#/components/SolarSystem/messages";
import { getShipPose, SHIP_ORBIT } from "#/components/SolarSystem/utils/ship";
import { useExplorer } from "#/hooks/useExplorer";
import { SOLAR_SYSTEM } from "#/utils/planets";

import { LabelNudges } from "./components/LabelNudges";
import { Orbits } from "./components/Orbits";
import { SceneCamera } from "./components/SceneCamera";
import { SceneClock } from "./components/SceneClock";
import { ScenePlanet } from "./components/ScenePlanet";
import { Ships } from "./components/Ships";
import { Stars } from "./components/Stars";
import { Sun } from "./components/Sun";
import { usePageVisible } from "./hooks/usePageVisible";
import type { SceneState } from "./types";
import { CAMERA_HEIGHT, PHONE_MAX_WIDTH } from "./utils/sceneMath";

// Phones get a lower pixel ratio, which keeps the scene smooth.
const PHONE_MAX_DPR = 1.5;
const DESKTOP_MAX_DPR = 2;
const CAMERA_FAR = CAMERA_HEIGHT * 4;

interface SpaceSceneProps {
  openPlanetId: string | undefined;
}

// The living system: a WebGL canvas drawn flat from straight above, with each site planet's
// label as a real link in the "planets" list on top of it. Decorative planets have no label.
export function SpaceScene({ openPlanetId }: SpaceSceneProps) {
  const isPageVisible = usePageVisible();
  // The labels render into this list once it exists.
  const [labelList, setLabelList] = useState<HTMLUListElement | null>(null);
  const explorer = useExplorer();
  const sceneStateRef = useRef<SceneState>({
    frameStep: 0,
    planetAngles: new Map(),
    shipPose: getShipPose(SHIP_ORBIT.phase),
  });

  // The open cockpit steps the system back, like an open planet.
  const isCockpitOpen = explorer.cockpit.status === "open";
  const isSystemFaded = openPlanetId !== undefined || isCockpitOpen;
  const maxDpr = window.innerWidth < PHONE_MAX_WIDTH ? PHONE_MAX_DPR : DESKTOP_MAX_DPR;

  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      <Canvas
        orthographic
        // No tone mapping: flat palette colors, exactly as in styles.css.
        flat
        dpr={[1, maxDpr]}
        frameloop={isPageVisible ? "always" : "never"}
        // The stencil clips each planet's spinning surface to its disc.
        gl={{ alpha: true, antialias: true, stencil: true }}
        camera={{ position: [0, 0, CAMERA_HEIGHT], near: 1, far: CAMERA_FAR }}
        aria-hidden="true"
      >
        <SceneClock sceneStateRef={sceneStateRef} />
        <SceneCamera openPlanetId={openPlanetId} sceneStateRef={sceneStateRef} />
        <Stars openPlanetId={openPlanetId} isCruising={isCockpitOpen} />
        <Sun isPlanetOpen={isSystemFaded} />
        <Orbits isPlanetOpen={isSystemFaded} />
        {labelList
          ? SOLAR_SYSTEM.map((planet, index) => (
              <ScenePlanet
                key={planet.id}
                planet={planet}
                openPlanetId={openPlanetId}
                isCockpitOpen={isCockpitOpen}
                sceneStateRef={sceneStateRef}
                labelList={labelList}
                // 0 is the cleared stencil, so refs start at 1.
                stencilRef={index + 1}
              />
            ))
          : null}
        {labelList ? (
          <LabelNudges
            labelList={labelList}
            openPlanetId={openPlanetId}
            sceneStateRef={sceneStateRef}
          />
        ) : null}
        <Ships openPlanetId={openPlanetId} sceneStateRef={sceneStateRef} />
      </Canvas>
      <nav aria-label={messages.planetsLabel} className="pointer-events-none absolute inset-0">
        <ul ref={setLabelList} />
      </nav>
    </div>
  );
}
