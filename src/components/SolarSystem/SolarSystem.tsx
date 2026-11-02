import { lazy, Suspense } from "react";

import { useSpaceMode } from "#/hooks/useSpaceMode";

import { StaticSystem } from "./components/StaticSystem";

// three.js loads only once the browser can show the scene; if it fails to load, the static
// system stays.
const SpaceScene = lazy(() =>
  import("./components/SpaceScene").then(
    (module) => ({ default: module.SpaceScene }),
    () => ({ default: StaticSystem }),
  ),
);

interface SolarSystemProps {
  openPlanetId: string | undefined;
}

// The server, tests and visitors without WebGL or with reduced motion get the static system;
// everyone else gets the 3D scene, with the static system shown while it loads.
export function SolarSystem({ openPlanetId }: SolarSystemProps) {
  const spaceMode = useSpaceMode();

  switch (spaceMode) {
    case "static":
      return <StaticSystem openPlanetId={openPlanetId} />;
    case "scene":
      return (
        <Suspense fallback={<StaticSystem openPlanetId={openPlanetId} />}>
          <SpaceScene openPlanetId={openPlanetId} />
        </Suspense>
      );
    default: {
      const unknownMode: never = spaceMode;
      return unknownMode;
    }
  }
}
