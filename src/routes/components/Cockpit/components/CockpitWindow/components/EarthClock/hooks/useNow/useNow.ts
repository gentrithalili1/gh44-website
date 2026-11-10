import { useSyncExternalStore } from "react";

const SECOND = 1000;

function subscribe(listener: () => void) {
  const timer = setInterval(listener, SECOND);
  return () => clearInterval(timer);
}

// Whole seconds, so the snapshot only changes when the clock would.
function getSnapshot() {
  return Math.floor(Date.now() / SECOND) * SECOND;
}

// The server has no clock to show: nothing until the browser takes over.
function getServerSnapshot() {
  return null;
}

// The time now in milliseconds, ticking every second; null on the server.
export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
