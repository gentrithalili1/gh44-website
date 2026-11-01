import { describe, expect, it } from "vitest";

import { findPlanet } from "#/utils/planets";

import {
  getCameraFocus,
  getHomePose,
  getPlanetPose,
  getPlanetReach,
  getShipCameraPose,
  mixPoses,
} from "./cameraFraming";

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
    expect(getHomePose(DESKTOP)).toEqual({ x: 0, y: 0, zoom: 900 / 1040 });
  });
});

describe("getPlanetPose", () => {
  const planet = { x: 100, y: 50 };

  it("sits the planet in the middle of the space the 672px panel leaves on desktop", () => {
    const pose = getPlanetPose({ viewport: DESKTOP, planetPosition: planet, reach: 40 });

    const onScreen = project({ pose, point: planet, viewport: DESKTOP });
    expect(onScreen.x).toBeCloseTo((1440 - 672) / 2);
    expect(onScreen.y).toBeCloseTo(450);
    // Its reach fills 42% of the 648px box.
    expect(40 * pose.zoom).toBeCloseTo(272.16);
  });

  it("keeps the planet and its reach clear of the panel on a 1280px screen", () => {
    const viewport = { width: 1280, height: 800 };
    const pose = getPlanetPose({ viewport, planetPosition: planet, reach: 40 });

    const onScreen = project({ pose, point: planet, viewport });
    expect(onScreen.x).toBeCloseTo((1280 - 672) / 2);
    expect(onScreen.x + 40 * pose.zoom).toBeLessThan(1280 - 672);
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

    expect(pose.zoom).toBeCloseTo((9 * 900) / 1040);
  });
});

describe("getShipCameraPose", () => {
  const ship = { x: -180, y: -160 };

  it("flies in close, the ship low and centered, behind even a phone's shorter console", () => {
    for (const viewport of [DESKTOP, PHONE]) {
      const pose = getShipCameraPose({ viewport, shipPosition: ship });

      const onScreen = project({ pose, point: ship, viewport });
      expect(onScreen.x).toBeCloseTo(viewport.width / 2);
      expect(onScreen.y).toBeCloseTo(viewport.height * 0.86);
    }
  });

  it("zooms to 3 pixels a unit on any screen: close on the ship, wide enough for planets nearby", () => {
    for (const viewport of [DESKTOP, PHONE]) {
      expect(getShipCameraPose({ viewport, shipPosition: ship }).zoom).toBe(3);
    }
  });
});

describe("getCameraFocus", () => {
  const AT_HOME = { openPlanetId: undefined, isCockpitOpen: false, flightPlanetId: undefined };

  it("looks at the whole system at home, and at the open planet on its page", () => {
    expect(getCameraFocus(AT_HOME)).toEqual({ kind: "home" });
    expect(getCameraFocus({ ...AT_HOME, openPlanetId: "work" })).toEqual({
      kind: "planet",
      planetId: "work",
    });
  });

  it("looks at the ship while the cockpit is open, even over a planet's page", () => {
    expect(getCameraFocus({ ...AT_HOME, isCockpitOpen: true })).toEqual({ kind: "ship" });
    expect(getCameraFocus({ ...AT_HOME, openPlanetId: "me", isCockpitOpen: true })).toEqual({
      kind: "ship",
    });
  });

  it("heads for the destination once the cockpit closes on a launch", () => {
    expect(getCameraFocus({ ...AT_HOME, isCockpitOpen: true, flightPlanetId: "work" })).toEqual({
      kind: "ship",
    });
    expect(getCameraFocus({ ...AT_HOME, flightPlanetId: "work" })).toEqual({
      kind: "planet",
      planetId: "work",
    });
  });
});

describe("getPlanetReach", () => {
  it("reaches as far as the outermost moon, satellite, ring or rocket", () => {
    const reaches = Object.fromEntries(
      ["me", "gh44-confirm", "work", "gh44-theme", "gh44-brain"].map((id) => {
        const planet = findPlanet(id);
        if (!planet) throw new Error(`No planet ${id}`);
        return [id, getPlanetReach(planet)];
      }),
    );

    expect(reaches).toEqual({
      // The moon: orbit 24 plus its radius 3.
      me: 27,
      // The rocket: 20 out from the surface, plus its 3-unit nose.
      "gh44-confirm": 33,
      // The outermost company moon: orbit 73 plus radius 2.3.
      work: expect.closeTo(75.3, 5),
      // The outermost ring band: 2.15 planet radii.
      "gh44-theme": expect.closeTo(45.15, 5),
      // The outermost agent rock: orbit 36.5 plus radius 2.2.
      "gh44-brain": expect.closeTo(38.7, 5),
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
