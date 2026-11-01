import { describe, expect, it } from "vitest";

import { createStarField, STAR_COUNT, STAR_DISTANCE } from "./starField";

describe("createStarField", () => {
  it("scatters every star on a far shell all around the system, above and below it", () => {
    const field = createStarField();
    const stars = Array.from({ length: STAR_COUNT }, (_, index) => ({
      x: field.positions[index * 3] ?? 0,
      y: field.positions[index * 3 + 1] ?? 0,
      z: field.positions[index * 3 + 2] ?? 0,
    }));

    for (const star of stars) {
      expect(Math.hypot(star.x, star.y, star.z)).toBeCloseTo(STAR_DISTANCE, 0);
    }
    const aboveShare = stars.filter((star) => star.y > 0).length / STAR_COUNT;
    expect(aboveShare).toBeGreaterThan(0.45);
    expect(aboveShare).toBeLessThan(0.55);
  });

  it("gives each star a depth layer, a size and a twinkle", () => {
    const field = createStarField({ random: () => 0.5 });

    expect(field.depths).toHaveLength(STAR_COUNT);
    expect([...new Set(field.depths)]).toEqual([0.5]);
    expect(field.sizes[0]).toBeCloseTo(0.85);
    expect(field.speeds[0]).toBeCloseTo(1.25);
  });
});
