import { describe, expect, it } from "vitest";

import { RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_MS, takeRequest } from "./rateLimit";

const FULL = Array.from({ length: RATE_LIMIT_REQUESTS }, (_, index) => index);

describe("takeRequest", () => {
  it("allows a request while the window has room", () => {
    expect(takeRequest({ times: [1, 2], now: 3 })).toEqual({ isAllowed: true, times: [1, 2, 3] });
  });

  it("refuses a request once the window is full", () => {
    expect(takeRequest({ times: FULL, now: 100 }).isAllowed).toBe(false);
  });

  it("forgets requests older than the window", () => {
    const result = takeRequest({ times: FULL, now: RATE_LIMIT_WINDOW_MS + 100 });

    expect(result).toEqual({ isAllowed: true, times: [RATE_LIMIT_WINDOW_MS + 100] });
  });
});
