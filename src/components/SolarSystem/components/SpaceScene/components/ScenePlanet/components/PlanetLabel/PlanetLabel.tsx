import { Link } from "@tanstack/react-router";

import type { PlanetState } from "#/components/SolarSystem/types";
import type { Planet } from "#/utils/planets";

interface PlanetLabelProps {
  planet: Planet;
  state: PlanetState;
  onHoverChange: (isHovered: boolean) => void;
}

// A fixed-size link under its planet, like the static system's. While a planet is open every
// label steps back, and comes back when it takes focus.
export function PlanetLabel({ planet, state, onHoverChange }: PlanetLabelProps) {
  function handleMouseEnter() {
    onHoverChange(true);
  }

  function handleMouseLeave() {
    onHoverChange(false);
  }

  return (
    <div
      data-state={state}
      className="flex -translate-x-1/2 flex-col items-center pt-2 text-center transition-opacity duration-400 data-[state=current]:opacity-0 data-[state=faded]:opacity-0 focus-within:opacity-100"
    >
      <Link
        to="/$planetId"
        params={{ planetId: planet.id }}
        data-state={state}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="pointer-events-auto data-[state=current]:pointer-events-none data-[state=faded]:pointer-events-none text-label tracking-label whitespace-nowrap text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground aria-[current=page]:text-foreground"
      >
        {planet.name}
      </Link>
      {/* Phones show names only: the inner planets sit close. */}
      <span className="hidden text-label-sub whitespace-nowrap text-faint md:block">
        {planet.sub}
      </span>
    </div>
  );
}
