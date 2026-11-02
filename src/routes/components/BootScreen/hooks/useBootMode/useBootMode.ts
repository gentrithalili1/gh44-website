import { useSyncExternalStore } from "react";

import { useSpaceMode } from "#/hooks/useSpaceMode";

// Set once the boot has played in this tab: later loads get the short version.
const BOOTED_KEY = "gh44-booted";

// pending: server and hydration, before the browser is known. skip: no 3D scene to wait for.
// quick: the boot already played this session. full: the whole boot log.
type BootModeStatus = "pending" | "skip" | "quick" | "full";

function subscribeToNothing() {
  return () => {};
}

function readHasBooted() {
  try {
    return sessionStorage.getItem(BOOTED_KEY) !== null;
  } catch {
    // Storage blocked: play the whole boot every time.
    return false;
  }
}

function markBooted() {
  try {
    sessionStorage.setItem(BOOTED_KEY, "true");
  } catch {
    // Storage blocked: the next load plays the whole boot again.
  }
}

// How much of the boot screen this load shows.
export function useBootMode() {
  const spaceMode = useSpaceMode();
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const hasBooted = useSyncExternalStore(subscribeToNothing, readHasBooted, () => false);

  const status = getBootModeStatus({ isClient, isStatic: spaceMode === "static", hasBooted });

  return { status, markBooted };
}

type GetBootModeStatusParams = { isClient: boolean; isStatic: boolean; hasBooted: boolean };

function getBootModeStatus({
  isClient,
  isStatic,
  hasBooted,
}: GetBootModeStatusParams): BootModeStatus {
  if (!isClient) return "pending";
  if (isStatic) return "skip";
  return hasBooted ? "quick" : "full";
}
