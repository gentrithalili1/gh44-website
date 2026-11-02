import { useState, useSyncExternalStore } from "react";

// Temporary: keeps casual visitors out while the site is tested in production. Public on purpose.
const LOCK_PASSWORD = "0509";
export const LOCK_STORAGE_KEY = "gh44-unlocked";
const UNLOCKED_VALUE = "true";

type LockStatus = "checking" | "locked" | "unlocked";

type UnlockOutcome = { status: "unlocked" } | { status: "failed"; reason: "wrongPassword" };

function readIsUnlocked() {
  try {
    return localStorage.getItem(LOCK_STORAGE_KEY) === UNLOCKED_VALUE;
  } catch {
    // Storage blocked: stay locked for this visit.
    return false;
  }
}

// The server has no storage: it renders the unchecked state, and the client checks after hydration.
function readServerIsUnlocked() {
  return null;
}

// Storage only changes through `unlock`, which also unlocks in memory.
function subscribe() {
  return () => {};
}

function storeUnlock() {
  try {
    localStorage.setItem(LOCK_STORAGE_KEY, UNLOCKED_VALUE);
  } catch {
    // Storage blocked or full: the unlock lasts for this visit only.
  }
}

export function useLock() {
  const isStoredUnlocked = useSyncExternalStore(subscribe, readIsUnlocked, readServerIsUnlocked);
  const [isUnlockedNow, setIsUnlockedNow] = useState(false);

  const status = getLockStatus({ isStoredUnlocked, isUnlockedNow });

  function unlock(password: string): UnlockOutcome {
    if (password !== LOCK_PASSWORD) return { status: "failed", reason: "wrongPassword" };
    setIsUnlockedNow(true);
    storeUnlock();
    return { status: "unlocked" };
  }

  return { status, unlock };
}

function getLockStatus({
  isStoredUnlocked,
  isUnlockedNow,
}: {
  isStoredUnlocked: boolean | null;
  isUnlockedNow: boolean;
}): LockStatus {
  if (isUnlockedNow || isStoredUnlocked === true) return "unlocked";
  if (isStoredUnlocked === null) return "checking";
  return "locked";
}
