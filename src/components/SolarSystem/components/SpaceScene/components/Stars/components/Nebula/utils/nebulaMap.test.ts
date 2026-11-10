import { describe, expect, it } from "vitest";

import { createNebulaMap, getNebulaAt, NEBULA_MAP_HEIGHT, NEBULA_MAP_WIDTH } from "./nebulaMap";

describe("getNebulaAt", () => {
  it("leaves the sky empty away from the band", () => {
    // Straight along the band's axis: as far from its plane as the sky gets.
    expect(getNebulaAt({ x: 0.35, y: 0.8, z: 0.48 }).density).toBe(0);
  });
});

describe("createNebulaMap", () => {
  it("stays faint everywhere and leaves most of the sky clear", () => {
    const pixels = createNebulaMap();
    const alphas = Array.from(
      { length: NEBULA_MAP_WIDTH * NEBULA_MAP_HEIGHT },
      (_, index) => pixels[index * 4 + 3] ?? 0,
    );

    const brightest = alphas.reduce((highest, alpha) => Math.max(highest, alpha), 0);

    expect(brightest).toBeGreaterThan(0.05);
    expect(brightest).toBeLessThanOrEqual(0.3);
    expect(alphas.filter((alpha) => alpha === 0).length / alphas.length).toBeGreaterThan(0.4);
  });
});
