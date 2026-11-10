import { lazy, Suspense } from "react";

import { useSpaceMode } from "#/hooks/useSpaceMode";

import { StaticSystem } from "./components/StaticSystem";

const SpaceScene = lazy(() =>
  import("./components/SpaceScene").then(
    (module) => ({ default: module.SpaceScene }),
    () => ({ default: StaticSystem }),
  ),
);

interface SolarSystemProps {
  openPlanetId: string | undefined;
  age?: number;
}

export function SolarSystem({ openPlanetId, age }: SolarSystemProps) {
  const spaceMode = useSpaceMode();

  const TEST = age?.toExponential(2);

  console.log(TEST);

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
