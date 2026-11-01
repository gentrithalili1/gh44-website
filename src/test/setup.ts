import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

vi.mock("@tanstack/react-start", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import("./serverFn")),
}));

// Server functions run in place in tests, with no request to read the visitor's IP from.
vi.mock("@tanstack/react-start/server", () => ({ getRequestHeader: () => "127.0.0.1" }));

// jsdom has no scrolling; the router scrolls to the top on every navigation.
window.scrollTo = vi.fn();

// jsdom has no matchMedia; default to a light system that never changes.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) satisfies MediaQueryList;

beforeEach(() => {
  // The root layout mounts the TanStack devtools in dev; tests render the production layout.
  vi.stubEnv("DEV", false);
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});
