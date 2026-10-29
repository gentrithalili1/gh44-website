import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// jsdom has no scrolling; the router scrolls to the top on every navigation.
window.scrollTo = vi.fn();

beforeEach(() => {
  // The root layout mounts the TanStack devtools in dev; tests render the production layout.
  vi.stubEnv("DEV", false);
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});
