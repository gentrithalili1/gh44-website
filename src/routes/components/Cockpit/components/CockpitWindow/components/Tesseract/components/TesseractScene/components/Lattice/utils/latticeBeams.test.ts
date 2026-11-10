import { describe, expect, it } from "vitest";

import { CELL, getLatticeBeams, type Sightline } from "./latticeBeams";

const SIGHTLINE: Sightline = { from: [0, -1, -2], to: [0, 0.2, 9.6], clearance: 3.2 };

describe("getLatticeBeams", () => {
  it("leaves the middle cell open: no beam runs through it", () => {
    for (const beam of getLatticeBeams(SIGHTLINE)) {
      const across = beam.position.filter((_, index) => "xyz"[index] !== beam.axis);

      expect(across.every((offset) => Math.abs(offset) >= CELL / 2)).toBe(true);
    }
  });

  it("drops the beams that would cross the view, and keeps the rest", () => {
    const all = getLatticeBeams({ ...SIGHTLINE, clearance: 0 });
    const clear = getLatticeBeams(SIGHTLINE);

    expect(all).toHaveLength(48);
    expect(clear.length).toBeLessThan(all.length);
    expect(clear.length).toBeGreaterThan(all.length / 2);
  });

  it("runs beams in all three directions, each once", () => {
    const beams = getLatticeBeams(SIGHTLINE);
    const ids = new Set(beams.map((beam) => beam.id));

    expect(ids.size).toBe(beams.length);
    expect(new Set(beams.map((beam) => beam.axis))).toEqual(new Set(["x", "y", "z"]));
  });
});
