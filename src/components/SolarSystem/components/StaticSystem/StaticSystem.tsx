import { Link } from "@tanstack/react-router";

import { messages } from "#/components/SolarSystem/messages";
import {
  getOrbitPosition,
  getPlanetState,
  SUN_GLOW_RADIUS,
  SUN_RADIUS,
  SYSTEM_SIZE,
} from "#/components/SolarSystem/utils/space";
import { SOLAR_SYSTEM } from "#/utils/planets";

import { SolarSystemPlanet } from "./components/SolarSystemPlanet";
import { StaticShip } from "./components/StaticShip";

const VIEW_BOX = `${-SYSTEM_SIZE / 2} ${-SYSTEM_SIZE / 2} ${SYSTEM_SIZE} ${SYSTEM_SIZE}`;

// A still frame of the system: the SVG draws it, the HTML on top holds the site planets' links at
// a readable size. Both share one unit, so the labels sit under their planets. Decorative planets
// have no label. The sun is gh44: everything revolves around it, and it only decorates.
interface StaticSystemProps {
  openPlanetId: string | undefined;
}

export function StaticSystem({ openPlanetId }: StaticSystemProps) {
  const isPlanetOpen = openPlanetId !== undefined;
  const planets = SOLAR_SYSTEM.map((planet) => ({
    planet,
    position: getOrbitPosition(planet.orbit),
    state: getPlanetState({ planetId: planet.id, openPlanetId }),
  }));
  const sitePlanets = planets.flatMap(({ planet, ...rest }) =>
    planet.kind === "site" ? [{ planet, ...rest }] : [],
  );

  return (
    <div
      style={{ "--system-size": SYSTEM_SIZE }}
      className="absolute inset-0 overflow-hidden [--space-unit:calc(min(100vw,100dvh)/var(--system-size))]"
    >
      <svg
        viewBox={VIEW_BOX}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="absolute inset-0 size-full"
      >
        <defs>
          <radialGradient id="sun-glow">
            <stop offset="0" stopOpacity={0.35} className="[stop-color:var(--sun)]" />
            <stop offset="1" stopOpacity={0} className="[stop-color:var(--sun)]" />
          </radialGradient>
        </defs>
        <g
          data-state={isPlanetOpen ? "faded" : "idle"}
          className="transition-opacity duration-600 ease-space data-[state=faded]:opacity-8"
        >
          {SOLAR_SYSTEM.map((planet) => (
            <circle
              data-testid="planet-orbit"
              key={planet.id}
              r={planet.orbit.radius}
              vectorEffect="non-scaling-stroke"
              className="fill-none stroke-rule"
            />
          ))}
          <circle r={SUN_GLOW_RADIUS} fill="url(#sun-glow)" />
          <circle r={SUN_RADIUS} className="fill-sun" />
        </g>
        {planets.map(({ planet, position, state }) => (
          <SolarSystemPlanet
            key={planet.id}
            planet={planet}
            x={position.x}
            y={position.y}
            state={state}
          />
        ))}
      </svg>
      <StaticShip isPlanetOpen={isPlanetOpen} />
      <nav aria-label={messages.planetsLabel}>
        <ul>
          {sitePlanets.map(({ planet, position, state }) => (
            <li
              key={planet.id}
              data-state={state}
              style={{ "--x": position.x, "--y": position.y, "--size": planet.size }}
              className="group absolute top-[calc(50%+(var(--y)-var(--size))*var(--space-unit))] left-[calc(50%+var(--x)*var(--space-unit))] flex -translate-x-1/2 flex-col items-center text-center transition-opacity duration-400 data-[state=faded]:opacity-0 data-[state=faded]:focus-within:opacity-100"
            >
              <Link
                to="/$planetId"
                params={{ planetId: planet.id }}
                data-state={state}
                className="flex flex-col items-center gap-1 text-label tracking-label whitespace-nowrap text-muted transition-colors hover:text-foreground focus-visible:outline-none aria-[current=page]:text-foreground"
              >
                {/* Covers the planet, so the planet itself opens its page. */}
                <span className="size-[calc(var(--size)*2*var(--space-unit))] rounded-full group-has-focus-visible:outline-2 group-has-focus-visible:outline-offset-4 group-has-focus-visible:outline-foreground" />
                {planet.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
