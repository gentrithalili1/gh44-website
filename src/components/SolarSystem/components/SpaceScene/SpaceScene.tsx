import { Canvas } from "@react-three/fiber";
import { useNavigate } from "@tanstack/react-router";
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
import { CAMERA_FOV } from "./hooks/useCameraFlight";
import { usePageVisible } from "./hooks/usePageVisible";
import type { SceneState } from "./types";
import { PHONE_MAX_WIDTH } from "./utils/sceneMath";

// Phones get a lower pixel ratio, which keeps the scene smooth.
const PHONE_MAX_DPR = 1.5;
const DESKTOP_MAX_DPR = 2;
// Past the farthest the visitor can zoom out on a phone, plus the system behind its center.
const CAMERA_FAR = 10000;
// The planets' night sides stay visible: a little light from everywhere.
const AMBIENT_INTENSITY = 0.3;

interface SpaceSceneProps {
  openPlanetId: string | undefined;
}

// The living system: a WebGL canvas in 3D, lit by the sun and seen at an angle, with each site
// planet's label as a real link in the "planets" list on top of it. Decorative planets have no
// label. Clicking empty space while a planet is open goes back home.
export function SpaceScene({ openPlanetId }: SpaceSceneProps) {
  const isPageVisible = usePageVisible();
  // The labels render into this list once it exists.
  const [labelList, setLabelList] = useState<HTMLUListElement | null>(null);
  const explorer = useExplorer();
  const navigate = useNavigate();
  const sceneStateRef = useRef<SceneState>({
    frameStep: 0,
    planetAngles: new Map(),
    shipPose: getShipPose(SHIP_ORBIT.phase),
  });

  // The open cockpit steps the system back, like an open planet.
  const isCockpitOpen = explorer.cockpit.status === "open";
  const isSystemFaded = openPlanetId !== undefined || isCockpitOpen;
  const maxDpr = window.innerWidth < PHONE_MAX_WIDTH ? PHONE_MAX_DPR : DESKTOP_MAX_DPR;

  function handlePointerMissed() {
    if (openPlanetId === undefined || explorer.cockpit.status !== "closed") return;
    void navigate({ to: "/" });
  }

  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      <Canvas
        // No tone mapping: palette colors as in styles.css, where the light falls fully.
        flat
        dpr={[1, maxDpr]}
        frameloop={isPageVisible ? "always" : "never"}
        // The stencil clips each planet's spinning surface to its disc.
        gl={{ alpha: true, antialias: true, stencil: true }}
        camera={{ fov: CAMERA_FOV, near: 1, far: CAMERA_FAR }}
        onPointerMissed={handlePointerMissed}
        aria-hidden="true"
      >
        <ambientLight intensity={AMBIENT_INTENSITY} />
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
