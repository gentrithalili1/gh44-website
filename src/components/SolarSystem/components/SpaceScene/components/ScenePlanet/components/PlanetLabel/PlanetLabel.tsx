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
    // The scene moves a label (`--label-nudge-x`, `--label-nudge-y`) when it would
    // touch another.
    <div
      data-state={state}
      data-planet-label={planet.id}
      className="flex translate-x-[calc(var(--label-nudge-x,0px)-50%)] translate-y-(--label-nudge-y,0px) flex-col items-center pt-1 text-center transition-opacity duration-400 data-[state=current]:opacity-0 data-[state=faded]:opacity-0 focus-within:opacity-100"
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
    </div>
  );
}
