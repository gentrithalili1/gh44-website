import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);

  return () => document.removeEventListener("visibilitychange", onChange);
}

function getSnapshot() {
  return document.visibilityState === "visible";
}

// The scene only renders while its tab is visible.
export function usePageVisible() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
