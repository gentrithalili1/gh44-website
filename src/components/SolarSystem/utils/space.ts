import type { PlanetState } from "../types";

// The system spans this many units across the shorter side of the screen.
export const SYSTEM_SIZE = 980;
export const SUN_RADIUS = 56;
export const SUN_GLOW_RADIUS = 150;

type Orbit = { radius: number; phase: number };

export function getOrbitPosition({ radius, phase }: Orbit) {
  return { x: Math.cos(phase) * radius, y: Math.sin(phase) * radius };
}

type GetPlanetStateParams = {
  planetId: string;
  openPlanetId: string | undefined;
};

export function getPlanetState({ planetId, openPlanetId }: GetPlanetStateParams): PlanetState {
  if (openPlanetId === undefined) return "idle";

  return planetId === openPlanetId ? "current" : "faded";
}
