import { useLocation } from "@tanstack/react-router";

import { useExploration } from "#/hooks/useExploration";
import { DESTINATIONS } from "#/utils/destinations";

import { RadarBlip, RadarFace } from "./CockpitRadar.elements";
import { messages } from "./messages";
import { getRadarBlips } from "./utils/radarBlips";

const RADAR_BLIPS = getRadarBlips();

// The radar screen: each destination where its planet starts on its orbit, lit once visited, and
// beside it where the ship is, the nearest destination not visited yet, and how many are done.
export function CockpitRadar() {
  const location = useLocation();
  const exploration = useExploration();

  const counts = { visited: exploration.visitedIds.length, total: DESTINATIONS.length };
  const next = DESTINATIONS.find(({ name }) => !exploration.visitedIds.includes(name));
  const rows = [
    { term: messages.route, value: location.pathname },
    { term: messages.next, value: next?.name ?? messages.allVisited },
    { term: messages.visited, value: messages.progress(counts) },
  ];

  return (
    <section aria-label={messages.label} className="flex items-center gap-3 md:gap-4">
      <svg
        role="img"
        aria-label={messages.scopeLabel(counts)}
        viewBox="-50 -50 100 100"
        className="size-16 shrink-0 md:size-20 md:[@media(min-height:50rem)]:size-24"
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
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 md:gap-2">
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-[0.6875rem] tabular-nums md:gap-y-1 md:text-xs">
          {rows.map((row) => (
            <div key={row.term} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-muted">{row.term}</dt>
              <dd className="truncate text-right text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
        <ol aria-hidden="true" className="flex gap-1">
          {DESTINATIONS.map(({ name }) => (
            <li
              key={name}
              className={`h-1 flex-1 rounded-full ${exploration.visitedIds.includes(name) ? "bg-sage shadow-[0_0_4px_var(--sage)]" : "bg-surface-active"}`}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
