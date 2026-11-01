import { useLocation } from "@tanstack/react-router";

import { useExploration } from "#/hooks/useExploration";
import { DESTINATIONS } from "#/utils/destinations";

import { messages } from "./messages";

// The console's right screen: where the ship is, how many destinations there are, and the
// nearest one not visited yet.
export function CockpitReadout() {
  const location = useLocation();
  const exploration = useExploration();

  const next = DESTINATIONS.find(({ name }) => !exploration.visitedIds.includes(name));
  const rows = [
    { term: messages.route, value: location.pathname },
    { term: messages.destinations, value: String(DESTINATIONS.length) },
    { term: messages.next, value: next?.name ?? messages.allVisited },
  ];

  return (
    <section aria-label={messages.label} className="flex flex-col gap-2">
      <p aria-hidden="true" className="text-[0.6875rem] text-muted">
        {messages.label}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs tabular-nums">
        {rows.map((row) => (
          <div key={row.term} className="col-span-2 grid grid-cols-subgrid">
            <dt className="text-muted">{row.term}</dt>
            <dd className="truncate text-right text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
      <ol aria-hidden="true" className="mt-1 flex gap-1">
        {DESTINATIONS.map(({ name }) => (
          <li
            key={name}
            className={`h-1 flex-1 rounded-full ${exploration.visitedIds.includes(name) ? "bg-sage" : "bg-surface-active"}`}
          />
        ))}
      </ol>
    </section>
  );
}
