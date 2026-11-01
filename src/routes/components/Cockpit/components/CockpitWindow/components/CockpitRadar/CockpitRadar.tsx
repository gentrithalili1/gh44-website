import { useExploration } from "#/hooks/useExploration";
import { DESTINATIONS } from "#/utils/destinations";

import { RadarBlip, RadarFace } from "./CockpitRadar.elements";
import { messages } from "./messages";
import { getRadarBlips } from "./utils/radarBlips";

const RADAR_BLIPS = getRadarBlips();

// A radar on the console's left screen: each destination where its planet starts on its orbit,
// lit once visited.
export function CockpitRadar() {
  const exploration = useExploration();

  const counts = { visited: exploration.visitedIds.length, total: DESTINATIONS.length };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <p aria-hidden="true" className="flex justify-between text-[0.6875rem] text-muted">
        <span>{messages.title}</span>
        <span className="text-sage">{messages.visited(counts)}</span>
      </p>
      <svg
        role="img"
        aria-label={messages.label(counts)}
        viewBox="-50 -50 100 100"
        className="mx-auto aspect-square min-h-0 w-full flex-1"
      >
        <RadarFace />
        {RADAR_BLIPS.map((blip) => (
          <RadarBlip
            key={blip.id}
            x={blip.x}
            y={blip.y}
            isVisited={exploration.visitedIds.includes(blip.id)}
          />
        ))}
      </svg>
    </div>
  );
}
