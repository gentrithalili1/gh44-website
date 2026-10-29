import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { applyInitialTheme, THEME_COLORS, THEME_SCRIPT, THEME_STORAGE_KEY } from "./theme";

const PARAMS = { storageKey: THEME_STORAGE_KEY, colors: THEME_COLORS };

function stubSystemTheme(systemTheme: "light" | "dark") {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: systemTheme === "dark" && query === "(prefers-color-scheme: dark)",
  }));
}

describe("applyInitialTheme", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("follows a dark system setting when nothing is saved", () => {
    stubSystemTheme("dark");

    applyInitialTheme(PARAMS);

    expect(document.documentElement).toHaveClass("dark");
  });

  it("follows a light system setting when nothing is saved", () => {
    stubSystemTheme("light");
    document.documentElement.classList.add("dark");

    applyInitialTheme(PARAMS);

    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("uses a saved light choice over a dark system setting", () => {
    stubSystemTheme("dark");
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    applyInitialTheme(PARAMS);

    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("uses a saved dark choice over a light system setting", () => {
    stubSystemTheme("light");
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    applyInitialTheme(PARAMS);

    expect(document.documentElement).toHaveClass("dark");
  });
});

describe("applyInitialTheme theme-color", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    document.head.innerHTML = "";
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds one browser theme color meta set to the active theme", () => {
    stubSystemTheme("light");
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    applyInitialTheme(PARAMS);

    applyInitialTheme(PARAMS);

    const metas = document.querySelectorAll('meta[name="theme-color"]');
    expect(metas).toHaveLength(1);
    expect(metas[0]).toHaveAttribute("content", THEME_COLORS.dark);
  });
});

describe("THEME_SCRIPT", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("runs on its own as an inline script and applies the saved choice", () => {
    stubSystemTheme("light");
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    const script = document.createElement("script");
    script.textContent = THEME_SCRIPT;
    document.head.append(script);
    script.remove();

    expect(document.documentElement).toHaveClass("dark");
  });
});
