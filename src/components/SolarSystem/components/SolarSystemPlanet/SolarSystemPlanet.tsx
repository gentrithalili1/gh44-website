import type { ReactNode } from "react";

import { getColorVars } from "#/utils/palette";
import type { Planet } from "#/utils/planets";

import type { PlanetState } from "../../types";
import { PlanetMoon } from "./SolarSystemPlanet.elements";
import { getBands, getMoons, getRocketTransform, getSignalRings } from "./utils/planetGeometry";

// gh44-theme's bands, top to bottom.
const BAND_CLASS_NAMES = ["fill-terracotta", "fill-lavender", "fill-blue", "fill-rose"] as const;

type Decoration = { layer: "behind" | "front"; element: ReactNode };

// A new decoration without a drawing breaks the build here.
function getDecoration(planet: Planet): Decoration | null {
  const decoration = planet.features.decoration;

  switch (decoration) {
    case undefined:
      return null;
    case "ring":
      return {
        layer: "behind",
        element: (
          <ellipse
            rx={planet.size * 1.9}
            ry={planet.size * 0.45}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            opacity={0.8}
            className="fill-none stroke-(--vivid) dark:stroke-(--hue)"
          />
        ),
      };
    case "bands": {
      const clipPathId = `planet-clip-${planet.id}`;

      return {
        layer: "front",
        element: (
          <>
            <clipPath id={clipPathId}>
              <circle r={planet.size} />
            </clipPath>
            <g clipPath={`url(#${clipPathId})`}>
              {getBands(planet).map((band, index) => (
                <rect
                  key={band.y}
                  x={-planet.size}
                  y={band.y}
                  width={planet.size * 2}
                  height={band.height}
                  opacity={0.6}
                  className={BAND_CLASS_NAMES[index]}
                />
              ))}
            </g>
          </>
        ),
      };
    }
    case "signal":
      return {
        layer: "front",
        element: getSignalRings(planet).map((ring) => (
          <circle
            key={ring.radius}
            r={ring.radius}
            opacity={ring.opacity}
            vectorEffect="non-scaling-stroke"
            className="fill-none stroke-(--vivid) dark:stroke-(--hue)"
          />
        )),
      };
    case "rocket":
      return {
        layer: "front",
        element: (
          <path
            d="M0 -5 L3 3 L0 1.5 L-3 3 Z"
            transform={getRocketTransform(planet)}
            className="fill-foreground"
          />
        ),
      };
    default: {
      const unknownDecoration: never = decoration;
      return unknownDecoration;
    }
  }
}

interface SolarSystemPlanetProps {
  planet: Planet;
  x: number;
  y: number;
  state: PlanetState;
}

export function SolarSystemPlanet({ planet, x, y, state }: SolarSystemPlanetProps) {
  const moons = getMoons(planet);
  const decoration = getDecoration(planet);

  return (
    <g
      transform={`translate(${x} ${y})`}
      data-state={state}
      style={getColorVars(planet.color)}
      className="transition-opacity duration-600 ease-space data-[state=faded]:opacity-8"
    >
      {moons.map((moon) => (
        <ellipse
          key={moon.id}
          rx={moon.orbitRadius}
          ry={moon.orbitTilt}
          vectorEffect="non-scaling-stroke"
          className="fill-none stroke-muted opacity-14"
        />
      ))}
      {moons
        .filter((moon) => !moon.isInFront)
        .map((moon) => (
          <PlanetMoon key={moon.id} {...moon} />
        ))}
      {decoration?.layer === "behind" ? decoration.element : null}
      <circle r={planet.size} className="fill-(--vivid) dark:fill-(--hue)" />
      {decoration?.layer === "front" ? decoration.element : null}
      {moons
        .filter((moon) => moon.isInFront)
        .map((moon) => (
          <PlanetMoon key={moon.id} {...moon} />
        ))}
    </g>
  );
}
