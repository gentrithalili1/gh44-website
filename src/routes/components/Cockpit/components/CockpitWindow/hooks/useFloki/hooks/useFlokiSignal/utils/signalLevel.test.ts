import { describe, expect, it } from "vitest";

import { getSignalLevel } from "./signalLevel";

describe("getSignalLevel", () => {
  it("is 0 for silence", () => {
    expect(getSignalLevel(new Float32Array(8))).toBe(0);
    expect(getSignalLevel([])).toBe(0);
  });

  it("grows with loudness", () => {
    expect(getSignalLevel([0.1, -0.1, 0.1, -0.1])).toBeCloseTo(0.4);
  });

  it("tops out at 1", () => {
    expect(getSignalLevel([1, -1, 1, -1])).toBe(1);
  });
});
