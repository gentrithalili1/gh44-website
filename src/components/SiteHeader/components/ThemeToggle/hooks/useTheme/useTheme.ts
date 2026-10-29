import { useSyncExternalStore } from "react";

import { THEME_STORAGE_KEY, type Theme } from "#/utils/theme";

// The `dark` class on <html> is the single source of truth: the inline theme script sets it
// before the first paint, and toggleTheme changes it and tells every subscriber.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// The server cannot know the theme; the client corrects it right after hydration.
function getServerSnapshot(): Theme {
  return "light";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    for (const listener of listeners) listener();
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Storage is blocked or full: the choice lasts for this page only.
    }
  };

  return { theme, toggleTheme };
}
