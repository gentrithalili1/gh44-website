import { describe, expect, it } from "vitest";

import { FLARE_SECONDS, getFlareLevel } from "./sunPokes";

describe("getFlareLevel", () => {
  it("starts full, eases off and ends", () => {
    expect(getFlareLevel({ flaredAt: null, now: 5 })).toBe(0);
    expect(getFlareLevel({ flaredAt: 5, now: 5 })).toBe(1);
    expect(getFlareLevel({ flaredAt: 5, now: 5 + FLARE_SECONDS / 2 })).toBeCloseTo(0.25);
    expect(getFlareLevel({ flaredAt: 5, now: 5 + FLARE_SECONDS })).toBe(0);
  });
});
