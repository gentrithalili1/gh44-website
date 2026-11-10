import { describe, expect, it } from "vitest";

import { getFlagWave } from "./flagWave";

describe("getFlagWave", () => {
  it("holds still at the pole", () => {
    for (const time of [0, 0.7, 3.1]) expect(getFlagWave({ along: 0, time })).toBeCloseTo(0);
  });

  it("swings the free end, and moves with time", () => {
    const now = getFlagWave({ along: 1, time: 0.5 });
    const later = getFlagWave({ along: 1, time: 0.8 });

    expect(Math.abs(now) + Math.abs(later)).toBeGreaterThan(0);
    expect(now).not.toBe(later);
  });
});
