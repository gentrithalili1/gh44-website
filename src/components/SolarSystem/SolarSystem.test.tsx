import { act, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderAt } from "#/test/renderAt";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const originalGetContext = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype,
  "getContext",
);

describe("SolarSystem", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (originalGetContext) {
      Object.defineProperty(HTMLCanvasElement.prototype, "getContext", originalGetContext);
    }
  });

  it("keeps the static system, with real links, when the visitor reduces motion", async () => {
    vi.stubGlobal("WebGLRenderingContext", class {});
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: () => ({ getExtension: () => null }),
    });
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query === REDUCED_MOTION_QUERY,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) satisfies MediaQueryList,
    );
    await renderAt("/");
    // Had the scene been chosen, it would replace the static drawing once its code loads.
    await act(() => import("./components/SpaceScene"));

    const planets = screen.getByRole("navigation", { name: "planets" });
    expect(within(planets).getByRole("link", { name: "me" })).toHaveAttribute("href", "/me");
    // Only the static drawing names Earth's moon without a hover.
    expect(screen.getByText("the moon")).toBeInTheDocument();
  });
});
