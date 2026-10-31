import { useSyncExternalStore } from "react";

import { DARK_SCHEME_QUERY, THEME_COLORS, THEME_STORAGE_KEY, type Theme } from "#/utils/theme";

// The `dark` class on <html> is the single source of truth: the inline theme script sets it
// before the first paint, and every change below updates it and tells the subscribers.
const listeners = new Set<() => void>();

function readSavedTheme(): Theme | null {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : null;
  } catch {
    // Storage is blocked: nothing is saved.
    return null;
  }
}

function getSystemTheme(): Theme {
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  for (const listener of listeners) listener();
}

// Follows the system setting while nothing is saved, and choices made in other tabs.
function handleSystemThemeChange() {
  if (readSavedTheme() === null) applyTheme(getSystemTheme());
}

function handleStorage(event: StorageEvent) {
  if (event.key === THEME_STORAGE_KEY) applyTheme(readSavedTheme() ?? getSystemTheme());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    window.matchMedia(DARK_SCHEME_QUERY).addEventListener("change", handleSystemThemeChange);
    window.addEventListener("storage", handleStorage);
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.matchMedia(DARK_SCHEME_QUERY).removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorage);
    }
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
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Storage is blocked or full: the choice lasts for this page only.
    }
  };

  return { theme, toggleTheme };
}
