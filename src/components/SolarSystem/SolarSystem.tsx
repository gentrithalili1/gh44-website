import { Link } from "@tanstack/react-router";

import { PLANETS } from "#/utils/planets";

import { SolarSystemPlanet } from "./components/SolarSystemPlanet";
import { useTheme } from "./hooks/useTheme";
import { messages } from "./messages";
import {
  getOrbitPosition,
  getPlanetState,
  SUN_GLOW_RADIUS,
  SUN_RADIUS,
  SYSTEM_SIZE,
} from "./utils/space";

const VIEW_BOX = `${-SYSTEM_SIZE / 2} ${-SYSTEM_SIZE / 2} ${SYSTEM_SIZE} ${SYSTEM_SIZE}`;

// A still frame of the system: the SVG draws it, the HTML on top holds the planet links and
// the sun switch at a readable size. Both share one unit, so the labels sit under their planets.
interface SolarSystemProps {
  openPlanetId: string | undefined;
}

export function SolarSystem({ openPlanetId }: SolarSystemProps) {
  const themeState = useTheme();

  const isSunOn = themeState.theme === "light";
  const isPlanetOpen = openPlanetId !== undefined;
  const sunLabel = isSunOn ? messages.turnOffSun : messages.turnOnSun;
  const planets = PLANETS.map((planet) => ({
    planet,
    position: getOrbitPosition(planet.orbit),
    state: getPlanetState({ planetId: planet.id, openPlanetId }),
  }));

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
          {PLANETS.map((planet) => (
            <circle
              key={planet.id}
              r={planet.orbit.radius}
              vectorEffect="non-scaling-stroke"
              className="fill-none stroke-rule"
            />
          ))}
          <circle r={SUN_GLOW_RADIUS} fill="url(#sun-glow)" />
          <circle r={SUN_RADIUS} className="fill-sun transition-colors duration-600" />
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
      <button
        type="button"
        aria-label={sunLabel}
        title={sunLabel}
        onClick={themeState.toggleTheme}
        style={{ "--size": SUN_RADIUS * 2 }}
        className="absolute top-1/2 left-1/2 size-[calc(var(--size)*var(--space-unit))] -translate-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      />
      <nav aria-label={messages.planetsLabel}>
        <ul>
          {planets.map(({ planet, position, state }) => (
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
                className="flex flex-col items-center gap-2 text-label tracking-label whitespace-nowrap text-muted transition-colors hover:text-foreground focus-visible:outline-none aria-[current=page]:text-foreground"
              >
                {/* Covers the planet, so the planet itself opens its page. */}
                <span className="size-[calc(var(--size)*2*var(--space-unit))] rounded-full group-has-focus-visible:outline-2 group-has-focus-visible:outline-offset-4 group-has-focus-visible:outline-foreground" />
                {planet.name}
              </Link>
              <span className="text-label-sub whitespace-nowrap text-faint">{planet.sub}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
