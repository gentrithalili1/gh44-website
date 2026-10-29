import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DARK_SCHEME_QUERY, THEME_STORAGE_KEY } from "#/utils/theme";

import { useTheme } from "./useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    localStorage.clear();
  });

  it("reads the theme from the dark class on <html>", () => {
    document.documentElement.classList.add("dark");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
  });

  it("updates every user of the hook when one toggles the theme", () => {
    const first = renderHook(() => useTheme());
    const second = renderHook(() => useTheme());

    act(() => first.result.current.toggleTheme());

    expect(first.result.current.theme).toBe("dark");
    expect(second.result.current.theme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("follows another tab's choice", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
      window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY }));
    });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
  });
});

describe("useTheme with a changing system setting", () => {
  let isSystemDark = false;
  const systemScheme = new EventTarget();

  function changeSystemTheme(isDark: boolean) {
    isSystemDark = isDark;
    systemScheme.dispatchEvent(new Event("change"));
  }

  beforeEach(() => {
    document.documentElement.className = "";
    localStorage.clear();
    isSystemDark = false;
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          get matches() {
            return query === DARK_SCHEME_QUERY && isSystemDark;
          },
          media: query,
          onchange: null,
          addEventListener: systemScheme.addEventListener.bind(systemScheme),
          removeEventListener: systemScheme.removeEventListener.bind(systemScheme),
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) satisfies MediaQueryList,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("follows the system setting while nothing is saved", () => {
    const { result } = renderHook(() => useTheme());

    act(() => changeSystemTheme(true));

    expect(result.current.theme).toBe("dark");
  });

  it("keeps a saved choice when the system setting changes", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme());

    act(() => changeSystemTheme(true));

    expect(result.current.theme).toBe("light");
  });
});
