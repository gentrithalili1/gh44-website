import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function stubReducedMotion(isReduced: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: isReduced && query === REDUCED_MOTION_QUERY,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) satisfies MediaQueryList,
  );
}

const originalGetContext = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype,
  "getContext",
);

// jsdom has no WebGL: hand out a stand-in context so the browser looks capable.
function stubWebGL() {
  vi.stubGlobal("WebGLRenderingContext", class {});
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: () => ({ getExtension: () => null }),
  });
}

function restoreCanvas() {
  if (originalGetContext) {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", originalGetContext);
  }
}

// Each test loads a fresh module: WebGL support is checked once per page.
async function loadUseSpaceMode() {
  vi.resetModules();
  const module = await import("./useSpaceMode");
  return module.useSpaceMode;
}

describe("useSpaceMode", () => {
  beforeEach(() => {
    stubReducedMotion(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    restoreCanvas();
  });

  it("shows the scene when the browser has WebGL and motion is allowed", async () => {
    stubWebGL();
    const useSpaceMode = await loadUseSpaceMode();

    const { result } = renderHook(() => useSpaceMode());

    expect(result.current).toBe("scene");
  });

  it("stays static with reduced motion", async () => {
    stubWebGL();
    stubReducedMotion(true);
    const useSpaceMode = await loadUseSpaceMode();

    const { result } = renderHook(() => useSpaceMode());

    expect(result.current).toBe("static");
  });

  it("stays static without WebGL", async () => {
    const useSpaceMode = await loadUseSpaceMode();

    const { result } = renderHook(() => useSpaceMode());

    expect(result.current).toBe("static");
  });

  it("stays static on the server", async () => {
    stubWebGL();
    const useSpaceMode = await loadUseSpaceMode();
    function SpaceMode() {
      return useSpaceMode();
    }

    expect(renderToString(createElement(SpaceMode))).toBe("static");
  });
});
