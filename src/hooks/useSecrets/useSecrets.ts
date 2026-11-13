import { useSyncExternalStore } from "react";

const SECRETS = ["ball", "horizon"] as const;
export type Secret = (typeof SECRETS)[number];

// One list per tab, like the exploration: a reload keeps it, a new tab starts over.
const STORAGE_KEY = "gh44-explorer-secrets";

const NO_SECRETS: readonly Secret[] = [];

const listeners = new Set<() => void>();

// The parsed list for the last raw value read, so every read of the same storage is one array.
let cache: { raw: string | null; found: readonly Secret[] } = { raw: null, found: NO_SECRETS };

function isSecret(value: unknown): value is Secret {
  return SECRETS.some((secret) => secret === value);
}

function parseSecrets(raw: string | null): readonly Secret[] {
  if (raw === null) return NO_SECRETS;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSecret) : NO_SECRETS;
  } catch {
    // Storage another script wrote, or a hand edit: nothing found yet.
    return NO_SECRETS;
  }
}

function getSnapshot() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw !== cache.raw) cache = { raw, found: parseSecrets(raw) };

  return cache.found;
}

function getServerSnapshot() {
  return NO_SECRETS;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Marks a secret found; each counts once. The server has no tab.
export function findSecret(secret: Secret) {
  if (typeof sessionStorage === "undefined") return;
  const found = getSnapshot();
  if (found.includes(secret)) return;

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...found, secret]));
  listeners.forEach((listener) => listener());
}

// The secrets this tab has found.
export function useSecrets() {
  const found = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { hasBall: found.includes("ball"), hasCrossedHorizon: found.includes("horizon") };
}
