import { useSyncExternalStore } from "react";

import { findPlanet, type PlanetId } from "#/utils/planets";

// One list per tab: a new tab starts a new exploration, a reload keeps it.
const STORAGE_KEY = "gh44-explorer-visits";

const NO_VISITS: readonly PlanetId[] = [];

const listeners = new Set<() => void>();

// The parsed list for the last raw value read, so every read of the same storage is one array.
let cache: { raw: string | null; visitedIds: readonly PlanetId[] } = {
  raw: null,
  visitedIds: NO_VISITS,
};

function parseVisits(raw: string | null): readonly PlanetId[] {
  if (raw === null) return NO_VISITS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return NO_VISITS;
    return parsed.flatMap((id: unknown) => {
      const planet = typeof id === "string" ? findPlanet(id) : undefined;
      return planet ? [planet.id] : [];
    });
  } catch {
    // Storage another script wrote, or a hand edit: start the exploration over.
    return NO_VISITS;
  }
}

function getSnapshot() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw !== cache.raw) cache = { raw, visitedIds: parseVisits(raw) };

  return cache.visitedIds;
}

function getServerSnapshot() {
  return NO_VISITS;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Opening a planet's page marks it visited; each planet counts once. The server has no tab.
export function recordVisit(planetId: PlanetId) {
  if (typeof sessionStorage === "undefined") return;
  const visitedIds = getSnapshot();
  if (visitedIds.includes(planetId)) return;

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...visitedIds, planetId]));
  listeners.forEach((listener) => listener());
}

// The planets this tab has visited, in the order first visited.
export function useExploration() {
  const visitedIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { visitedIds };
}
