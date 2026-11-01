import { getOrbitPosition } from "#/components/SolarSystem/utils/space";
import { DESTINATIONS } from "#/utils/destinations";
import { findPlanet } from "#/utils/planets";

// The radar's reach, in its own units; the outermost planet sits just inside it.
const RADAR_RADIUS = 42;

// Each destination's planet on the radar at its starting angle. A square root spreads the inner
// planets out, which would otherwise crowd the center.
export function getRadarBlips() {
  const planets = DESTINATIONS.flatMap(({ name }) => findPlanet(name) ?? []);
  const outermost = Math.max(...planets.map((planet) => planet.orbit.radius));

  return planets.map((planet) => ({
    id: planet.id,
    ...getOrbitPosition({
      radius: RADAR_RADIUS * Math.sqrt(planet.orbit.radius / outermost),
      phase: planet.orbit.phase,
    }),
  }));
}
