export const THEME_STORAGE_KEY = "gh44-theme";

export type Theme = "light" | "dark";

// The page background of each theme, for the browser's `theme-color`.
export const THEME_COLORS = { light: "#FAF7F3", dark: "#1E1F22" } as const satisfies Record<
  Theme,
  string
>;

// Runs as an inline script before the first paint, built from this function's source. Keep it
// self-contained: no imports, nested functions or syntax the bundler would rewrite into helpers.
export function applyInitialTheme(storageKey: string) {
  let savedTheme: string | null = null;
  try {
    savedTheme = window.localStorage.getItem(storageKey);
  } catch {
    // Storage is blocked: let the system setting decide.
  }
  const isDark = savedTheme
    ? savedTheme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", isDark);
}

export const THEME_SCRIPT = `(${applyInitialTheme.toString()})(${JSON.stringify(THEME_STORAGE_KEY)})`;
