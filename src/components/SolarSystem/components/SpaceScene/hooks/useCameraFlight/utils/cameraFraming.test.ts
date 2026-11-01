import { describe, expect, it } from "vitest";

import { findPlanet } from "#/utils/planets";

import { getHomePose, getPlanetPose, getPlanetReach, mixPoses } from "./cameraFraming";

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

type Pose = { x: number; y: number; zoom: number };

// Where a system point lands on screen, in pixels from the top left.
function project({
  pose,
  point,
  viewport,
}: {
  pose: Pose;
  point: { x: number; y: number };
  viewport: typeof DESKTOP;
}) {
  return {
    x: viewport.width / 2 + (point.x - pose.x) * pose.zoom,
    y: viewport.height / 2 + (point.y - pose.y) * pose.zoom,
  };
}

describe("getHomePose", () => {
  it("centers the sun and fits the whole system to the shorter side", () => {
    expect(getHomePose(DESKTOP)).toEqual({ x: 0, y: 0, zoom: 900 / 980 });
  });
});

describe("getPlanetPose", () => {
  const planet = { x: 100, y: 50 };

  it("sits the planet in the middle of the left 45% on desktop, beside the panel", () => {
    const pose = getPlanetPose({ viewport: DESKTOP, planetPosition: planet, reach: 40 });

    const onScreen = project({ pose, point: planet, viewport: DESKTOP });
    expect(onScreen.x).toBeCloseTo(432);
    expect(onScreen.y).toBeCloseTo(450);
    // Its reach fills 42% of the 648px box.
    expect(40 * pose.zoom).toBeCloseTo(272.16);
  });

  it("sits the planet in the top 38% on a phone, above the sheet", () => {
    const pose = getPlanetPose({ viewport: PHONE, planetPosition: planet, reach: 40 });

    const onScreen = project({ pose, point: planet, viewport: PHONE });
    expect(onScreen.x).toBeCloseTo(195);
    expect(onScreen.y).toBeCloseTo(160.36);
    expect(40 * pose.zoom).toBeCloseTo(134.7, 1);
  });

  it("zooms a small planet in at most 9 times", () => {
    const pose = getPlanetPose({ viewport: DESKTOP, planetPosition: planet, reach: 1 });

    expect(pose.zoom).toBeCloseTo((9 * 900) / 980);
  });
});

describe("getPlanetReach", () => {
  it("reaches as far as the outermost moon, satellite, ring or rocket", () => {
    const reaches = Object.fromEntries(
      ["me", "confirm", "work", "gh44-theme", "gh44-brain"].map((id) => {
        const planet = findPlanet(id);
        if (!planet) throw new Error(`No planet ${id}`);
        return [id, getPlanetReach(planet)];
      }),
    );

    expect(reaches).toEqual({
      // The moon: orbit 24 plus its radius 3.
      me: 27,
      // The rocket: 20 out from the surface, plus its 3-unit nose.
      confirm: 33,
      // The outermost company moon: orbit 75 plus radius 2.3.
      work: expect.closeTo(77.3, 5),
      // The outermost ring band: 2.15 planet radii.
      "gh44-theme": expect.closeTo(47.3, 5),
      // The outermost agent: orbit 40 plus radius 1.8.
      "gh44-brain": expect.closeTo(41.8, 5),
    });
  });
});

describe("mixPoses", () => {
  const from = { x: 0, y: 0, zoom: 1 };
  const to = { x: 100, y: 0, zoom: 4 };
  const anchor = { x: 100, y: 0 };

  it("starts at the first pose and lands on the second", () => {
    expect(mixPoses({ from, to, anchor, progress: 0 })).toEqual(from);
    expect(mixPoses({ from, to, anchor, progress: 1 })).toEqual(to);
  });

  it("zooms on a log scale and moves the anchor straight across the screen", () => {
    // Halfway: zoom 2 (between 1 and 4 on a log scale); the anchor is 50px right of center,
    // halfway between 100px and 0px, so the camera sits 25 units left of it.
    const pose = mixPoses({ from, to, anchor, progress: 0.5 });

    expect(pose.zoom).toBeCloseTo(2);
    expect(pose.x).toBeCloseTo(75);
    expect(pose.y).toBeCloseTo(0);
  });
});
