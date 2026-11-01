import { PLANETS, type PlanetId } from "./planets";

export type Destination = { name: PlanetId; route: `/${PlanetId}`; description: string };

// Where the explorer can fly: every planet page, so `go`, the chips and the routes always match.
export const DESTINATIONS: readonly Destination[] = PLANETS.map((planet) => ({
  name: planet.id,
  route: `/${planet.id}`,
  description: planet.sub,
}));
