import { describe, expect, it } from "vitest";

import { addPoke, FLARE_SECONDS, getFlareLevel, POKES_TO_FLARE } from "./sunPokes";

describe("addPoke", () => {
  it("flares on the fifth quick poke, and starts over", () => {
    let pokes: readonly number[] = [];
    const flares = Array.from({ length: POKES_TO_FLARE }, (_, index) => {
      const result = addPoke({ pokes, now: index * 0.3 });
      pokes = result.pokes;
      return result.isFlare;
    });

    expect(flares).toEqual([false, false, false, false, true]);
    expect(pokes).toEqual([]);
  });

  it("forgets slow pokes", () => {
    let pokes: readonly number[] = [];
    for (let index = 0; index < 10; index++) {
      const result = addPoke({ pokes, now: index * 2 });
      pokes = result.pokes;
      expect(result.isFlare).toBe(false);
    }
  });
});

describe("getFlareLevel", () => {
  it("starts full, eases off and ends", () => {
    expect(getFlareLevel({ flaredAt: null, now: 5 })).toBe(0);
    expect(getFlareLevel({ flaredAt: 5, now: 5 })).toBe(1);
    expect(getFlareLevel({ flaredAt: 5, now: 5 + FLARE_SECONDS / 2 })).toBeCloseTo(0.25);
    expect(getFlareLevel({ flaredAt: 5, now: 5 + FLARE_SECONDS })).toBe(0);
  });
});
