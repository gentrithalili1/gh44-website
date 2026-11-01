import { describe, expect, it } from "vitest";

import { findPlanet } from "#/utils/planets";

import { getSurfacePaint } from "./surfacePaint";

function getPlanet(id: string) {
  const planet = findPlanet(id);
  if (!planet) throw new Error(`No planet ${id}`);
  return planet;
}

describe("getSurfacePaint", () => {
  it("paints a bare planet nothing", () => {
    expect(getSurfacePaint(getPlanet("gh44-theme"))).toEqual([]);
  });

  it("wraps a band all the way round at its latitude", () => {
    const [band] = getSurfacePaint(getPlanet("gh44-brain"));

    // Neptune's first band runs from 0.45 to 0.2 planet radii above the equator.
    expect(band).toEqual({
      kind: "stripe",
      color: "blue",
      shade: "vivid",
      opacity: 0.35,
      top: expect.closeTo(0.5 - Math.asin(0.45) / Math.PI, 5),
      bottom: expect.closeTo(0.5 - Math.asin(0.2) / Math.PI, 5),
    });
  });

  it("puts a feature where it showed on the disc, facing the camera, and its copy on the far side", () => {
    // Jupiter's red spot sat 0.3 radii right of center and 0.22 below it.
    const spots = getSurfacePaint(getPlanet("work")).filter((paint) => paint.kind === "spot");
    const latitude = Math.asin(-0.22);
    const longitude = Math.asin(0.3 / Math.cos(latitude));

    // The globe's front, toward the home camera, is a quarter of the way round its map.
    expect(spots.map((spot) => spot.u)).toEqual([
      expect.closeTo(0.25 + longitude / (2 * Math.PI), 5),
      expect.closeTo(0.75 + longitude / (2 * Math.PI), 5),
    ]);
    expect(spots[0]?.v).toBeCloseTo(0.5 - latitude / Math.PI);
    expect(spots[0]).toMatchObject({ color: "red", shade: "soft", opacity: 1 });
  });
});
