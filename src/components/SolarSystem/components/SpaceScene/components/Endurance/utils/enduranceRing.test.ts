import { describe, expect, it } from "vitest";

import { getRingModules, MODULE_COUNT, RING_RADIUS } from "./enduranceRing";

describe("getRingModules", () => {
  it("spaces twelve modules evenly round the wheel, each on the rim", () => {
    const modules = getRingModules();

    expect(modules).toHaveLength(MODULE_COUNT);
    for (const module of modules) {
      expect(Math.hypot(module.x, module.y)).toBeCloseTo(RING_RADIUS);
    }
    expect(modules[3]?.turn).toBeCloseTo(Math.PI / 2);
  });

  it("takes turns between two sizes", () => {
    const [first, second, third] = getRingModules();

    expect(first?.size).not.toEqual(second?.size);
    expect(first?.size).toEqual(third?.size);
  });
});
