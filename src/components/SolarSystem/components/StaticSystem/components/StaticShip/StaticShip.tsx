import { messages } from "#/components/SolarSystem/messages";
import { SHIP_LENGTH, SHIP_ORBIT, SHIP_SCALE } from "#/components/SolarSystem/utils/ship";
import { getOrbitPosition } from "#/components/SolarSystem/utils/space";
import { useExplorer } from "#/hooks/useExplorer";

import { StaticShipDrawing } from "./StaticShip.elements";

const SHIP_POSITION = getOrbitPosition(SHIP_ORBIT);

interface StaticShipProps {
  isPlanetOpen: boolean;
}

// The gh44 explorer, still, between Mars and Jupiter: it opens the cockpit, from any page. It
// steps back with everything else while a planet is open, and comes forward when pointed at.
export function StaticShip({ isPlanetOpen }: StaticShipProps) {
  const explorer = useExplorer();

  return (
    <button
      type="button"
      aria-label={messages.shipName}
      aria-haspopup="dialog"
      aria-expanded={explorer.cockpit.status === "open"}
      onClick={explorer.openCockpit}
      data-state={isPlanetOpen ? "faded" : "idle"}
      style={{
        "--x": SHIP_POSITION.x,
        "--y": SHIP_POSITION.y,
        "--ship-size": SHIP_LENGTH * SHIP_SCALE,
      }}
      className="group absolute top-[calc(50%+var(--y)*var(--space-unit))] left-[calc(50%+var(--x)*var(--space-unit))] size-[max(2.25rem,calc(var(--ship-size)*var(--space-unit)))] -translate-1/2 rounded-full transition-opacity duration-600 ease-space focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground data-[state=faded]:opacity-8 data-[state=faded]:hover:opacity-100 data-[state=faded]:focus-visible:opacity-100"
    >
      <StaticShipDrawing />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-full left-1/2 mt-1 flex -translate-x-1/2 flex-col items-center text-label tracking-label whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span className="text-foreground">{messages.shipName}</span>
        <span className="text-label-sub text-terracotta">{messages.shipAction}</span>
      </span>
    </button>
  );
}
