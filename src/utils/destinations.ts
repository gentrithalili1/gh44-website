import { PLANETS, type PlanetId } from "./planets";

export type Destination = { name: PlanetId; route: `/${PlanetId}`; description: string };

type SitePlanet = (typeof PLANETS)[number];

// The order the cockpit lists them in: who, then what he has done, then what he has built.
const DESTINATION_ORDER = [
  "me",
  "work",
  "gh44-confirm",
  "gh44-theme",
  "gh44-brain",
] as const satisfies readonly PlanetId[];

function toDestination(planet: SitePlanet): Destination {
  return { name: planet.id, route: `/${planet.id}`, description: planet.sub };
}

// Where in the order a planet goes; one missing from it goes at the end.
function getRank(planet: SitePlanet) {
  const rank = DESTINATION_ORDER.findIndex((id) => id === planet.id);
  return rank === -1 ? DESTINATION_ORDER.length : rank;
}

// Where the explorer can fly: every planet page, so `go`, the chips and the routes always match.
export const DESTINATIONS: readonly Destination[] = [...PLANETS]
  .sort((a, b) => getRank(a) - getRank(b))
  .map(toDestination);
