import { describe, expect, it } from "vitest";

import { createWarpField, STREAK_COUNT, TUNNEL_DEPTH } from "./warpField";

describe("createWarpField", () => {
  it("gives every streak four corners sharing one seed, and two triangles", () => {
    let calls = 0;
    const field = createWarpField(() => (calls++ % 10) / 10);

    expect(field.seeds).toHaveLength(STREAK_COUNT * 4 * 4);
    expect(field.corners).toHaveLength(STREAK_COUNT * 4 * 2);
    expect(field.triangles).toHaveLength(STREAK_COUNT * 6);
    expect(field.positions).toHaveLength(STREAK_COUNT * 4 * 3);
    expect(Array.from(field.seeds.slice(4, 8))).toEqual(Array.from(field.seeds.slice(0, 4)));
    expect(Array.from(field.triangles.slice(6, 12))).toEqual([4, 5, 6, 5, 7, 6]);
  });

  it("starts every streak inside the tunnel, off the view axis", () => {
    const field = createWarpField(Math.random);

    for (let index = 0; index < field.seeds.length; index += 4) {
      expect(field.seeds[index + 1]).toBeGreaterThan(0);
      expect(field.seeds[index + 2]).toBeLessThanOrEqual(TUNNEL_DEPTH);
    }
  });
});
