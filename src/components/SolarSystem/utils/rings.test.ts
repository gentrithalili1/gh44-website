import { describe, expect, it } from "vitest";

import { findPlanet } from "#/utils/planets";

import { getRingBands } from "./rings";

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
