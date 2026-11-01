import { act } from "@testing-library/react";
import { vi } from "vitest";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function stubReducedMotion(isReduced: boolean) {
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

// jsdom has no IntersectionObserver: everything observed is on screen at once.
export function stubOnScreen() {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private onChange: (entries: { isIntersecting: boolean }[]) => void) {}
      observe() {
        this.onChange([{ isIntersecting: true }]);
      }
      disconnect() {}
    },
  );
}

// Animations run on animation frames; the other timers stay real for the router.
export function fakeFrames() {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
}

export function playFor(ms: number) {
  act(() => vi.advanceTimersByTime(ms));
}
