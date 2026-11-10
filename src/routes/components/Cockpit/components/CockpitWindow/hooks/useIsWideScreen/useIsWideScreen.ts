import { useSyncExternalStore } from "react";

// The `md` breakpoint: from here up the screen is wide, below it a phone.
const WIDE_QUERY = "(min-width: 48rem)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(WIDE_QUERY).matches;
}

// The server renders for a phone; the client corrects it after hydration.
function getServerSnapshot() {
  return false;
}

// Whether the screen is wide (a desktop or a tablet), following it as it resizes.
export function useIsWideScreen() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
