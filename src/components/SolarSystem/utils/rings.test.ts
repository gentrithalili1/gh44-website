import { describe, expect, it } from "vitest";

import { DECORATIVE_PLANETS, findPlanet } from "#/utils/planets";

import { getRingBands, getUprightRing } from "./rings";

describe("getRingBands", () => {
  it("gives Saturn 7 bands, one per app, each in its app color", () => {
    const saturn = findPlanet("gh44-theme");
    if (!saturn) throw new Error("No Saturn");

    expect(getRingBands(saturn).map(({ label, color }) => [label, color])).toEqual([
      ["gh44 for zed", "blue"],
      ["gh44 for warp", "terracotta"],
      ["gh44 for slack", "rose"],
      ["gh44 for linear", "lavender"],
      ["gh44 for chrome", "sage"],
      ["gh44 for github", "sand"],
      ["gh44 for shadcn/ui", "seafoam"],
    ]);
  });

  it("lays the bands outward from the planet without overlapping", () => {
    const saturn = findPlanet("gh44-theme");
    if (!saturn) throw new Error("No Saturn");
    const bands = getRingBands(saturn);

    expect(bands[0]?.innerRadius).toBeGreaterThan(saturn.size);
    bands.slice(1).forEach((band, index) => {
      expect(band.innerRadius).toBeGreaterThan(bands[index]?.outerRadius ?? Infinity);
    });
  });
});

describe("getUprightRing", () => {
  it("stands Uranus' one thin ring almost upright, reaching past the planet", () => {
    const uranus = DECORATIVE_PLANETS.find((planet) => planet.id === "uranus");
    if (!uranus) throw new Error("No Uranus");
    const ring = getUprightRing(uranus);
    if (!ring) throw new Error("No ring");

    expect(getRingBands(uranus)).toEqual([]);
    expect(ring.innerRadius).toBeGreaterThan(uranus.size);
    expect(ring.outerRadius - ring.innerRadius).toBeLessThan(uranus.size * 0.2);
    expect(ring.squash).toBeLessThan(0.5);
    expect(Math.abs(ring.lean)).toBeLessThan(Math.PI / 8);
  });

  it("gives no other planet an upright ring", () => {
    const saturn = findPlanet("gh44-theme");
    if (!saturn) throw new Error("No Saturn");

    expect(getUprightRing(saturn)).toBeUndefined();
  });
});
