import type { PlanetState } from "#/components/SolarSystem/types";
import { getOrbiters } from "#/components/SolarSystem/utils/orbiters";
import { getRingBands, type RingBand } from "#/components/SolarSystem/utils/rings";
import {
  getRocketPose,
  getTiltedPoint,
  ORBIT_TILT,
  ROCKET_OUTLINE,
} from "#/components/SolarSystem/utils/space";
import { getSurfaceShapes } from "#/components/SolarSystem/utils/surface";
import { getColorVars } from "#/utils/palette";
import type { Planet } from "#/utils/planets";

import { PlanetOrbiter, PlanetSurfaceShape } from "./SolarSystemPlanet.elements";

const RADIANS_TO_DEGREES = 180 / Math.PI;
// A still frame of the rocket's flight.
const ROCKET_ANGLE = 0.6;
const ROCKET_PATH = `M ${ROCKET_OUTLINE.map((point) => `${point.x} ${point.y}`).join(" L ")} Z`;

// A flat ring band between two tilted ellipses; even-odd fill leaves the middle open.
function getRingBandPath({ innerRadius, outerRadius }: RingBand) {
  const ellipse = (radius: number) => {
    const ry = radius * ORBIT_TILT;
    return `M ${-radius} 0 A ${radius} ${ry} 0 1 0 ${radius} 0 A ${radius} ${ry} 0 1 0 ${-radius} 0 Z`;
  };

  return `${ellipse(outerRadius)} ${ellipse(innerRadius)}`;
}

interface SolarSystemPlanetProps {
  planet: Planet;
  x: number;
  y: number;
  state: PlanetState;
}

// A still frame of one planet: what passes behind it, its body and surface, then what passes in
// front (the near half of tilted orbits and rings).
export function SolarSystemPlanet({ planet, x, y, state }: SolarSystemPlanetProps) {
  const orbiters = getOrbiters(planet).map((orbiter) => ({
    orbiter,
    point: getTiltedPoint({ radius: orbiter.orbitRadius, angle: orbiter.phase }),
  }));
  const ringBands = getRingBands(planet);
  const rocket = planet.features.hasRocket
    ? getRocketPose({ planetSize: planet.size, angle: ROCKET_ANGLE })
    : null;
  const nearHalfClipId = `near-half-${planet.id}`;

  return (
    <g
      transform={`translate(${x} ${y})`}
      data-state={state}
      style={getColorVars(planet.color)}
      className="transition-opacity duration-600 ease-space data-[state=faded]:opacity-8"
    >
      {orbiters.map(({ orbiter }) => (
        <ellipse
          key={orbiter.id}
          rx={orbiter.orbitRadius}
          ry={orbiter.orbitRadius * ORBIT_TILT}
          vectorEffect="non-scaling-stroke"
          className="fill-none stroke-muted opacity-14"
        />
      ))}
      {orbiters
        .filter(({ point }) => !point.isInFront)
        .map(({ orbiter, point }) => (
          <PlanetOrbiter key={orbiter.id} orbiter={orbiter} x={point.x} y={point.y} />
        ))}
      {ringBands.map((band) => (
        <path
          key={band.id}
          d={getRingBandPath(band)}
          fillRule="evenodd"
          style={getColorVars(band.color)}
          className="fill-(--hue)"
        >
          <title>{band.label}</title>
        </path>
      ))}
      <circle r={planet.size} className="fill-(--hue)" />
      {getSurfaceShapes(planet).map((shape) => (
        <PlanetSurfaceShape key={shape.id} shape={shape} />
      ))}
      {ringBands.length > 0 ? (
        <>
          <clipPath id={nearHalfClipId}>
            <rect x={-planet.size * 3} y={0} width={planet.size * 6} height={planet.size * 3} />
          </clipPath>
          <g clipPath={`url(#${nearHalfClipId})`} className="pointer-events-none">
            {ringBands.map((band) => (
              <path
                key={band.id}
                d={getRingBandPath(band)}
                fillRule="evenodd"
                style={getColorVars(band.color)}
                className="fill-(--hue)"
              />
            ))}
          </g>
        </>
      ) : null}
      {rocket ? (
        <path
          d={ROCKET_PATH}
          transform={`translate(${rocket.x} ${rocket.y}) rotate(${rocket.rotation * RADIANS_TO_DEGREES})`}
          className="fill-foreground"
        />
      ) : null}
      {orbiters
        .filter(({ point }) => point.isInFront)
        .map(({ orbiter, point }) => (
          <PlanetOrbiter key={orbiter.id} orbiter={orbiter} x={point.x} y={point.y} />
        ))}
    </g>
  );
}
