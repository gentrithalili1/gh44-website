import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { getOrbitAngle } from "#/components/SolarSystem/utils/motion";
import { getShipAngle, getShipPose } from "#/components/SolarSystem/utils/ship";
import { getOrbitPosition } from "#/components/SolarSystem/utils/space";
import { findPlanet, SOLAR_SYSTEM } from "#/utils/planets";

import {
  CAMERA_FOV,
  type CameraAngle,
  type CameraPose,
  getCameraAngle,
  getCameraDistance,
  getCameraFocus,
  getCameraPlacement,
  getDistanceLimits,
  getHomePose,
  getPlanetPose,
  getPlanetReach,
  getShipCameraAngle,
  getShipCameraPose,
  HOME_ANGLE,
  mixAngles,
  mixPoses,
} from "./cameraFraming";

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

// Where a system point lands on screen, in pixels from the top left, through a real perspective
// camera placed for the pose.
function project({
  pose,
  point,
  viewport,
  angle = HOME_ANGLE,
}: {
  pose: CameraPose;
  point: { x: number; y: number };
  viewport: typeof DESKTOP;
  angle?: CameraAngle;
}) {
  const placement = getCameraPlacement({ pose, angle, viewport });
  const camera = new PerspectiveCamera(CAMERA_FOV, viewport.width / viewport.height, 1, 10000);
  camera.position.set(...placement.position);
  camera.lookAt(...placement.target);
  camera.setViewOffset(
    viewport.width,
    viewport.height,
    placement.viewOffset.x,
    placement.viewOffset.y,
    viewport.width,
    viewport.height,
  );
  camera.updateMatrixWorld();
  const projected = new Vector3(point.x, 0, point.y).project(camera);

  return {
    x: ((projected.x + 1) / 2) * viewport.width,
    y: ((1 - projected.y) / 2) * viewport.height,
  };
}

describe("getHomePose", () => {
  it("centers the sun and fits the whole system to the shorter side", () => {
    expect(getHomePose(DESKTOP)).toEqual({ x: 0, y: 0, zoom: 900 / 1040, offset: { x: 0, y: 0 } });
  });

  it("shows the sun in the middle of the screen from the home angle", () => {
    const onScreen = project({
      pose: getHomePose(DESKTOP),
      point: { x: 0, y: 0 },
      viewport: DESKTOP,
    });

    expect(onScreen.x).toBeCloseTo(720);
    expect(onScreen.y).toBeCloseTo(450);
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

  it("keeps the planet there from any angle the visitor orbits to", () => {
    const pose = getPlanetPose({ viewport: DESKTOP, planetPosition: planet, reach: 40 });

    const onScreen = project({
      pose,
      point: planet,
      viewport: DESKTOP,
      angle: { polar: 1.2, azimuth: -2 },
    });
    expect(onScreen.x).toBeCloseTo((1440 - 672) / 2);
    expect(onScreen.y).toBeCloseTo(450);
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

describe("getCameraPlacement", () => {
  it("backs off far enough that one unit at the target spans `zoom` pixels", () => {
    const pose = { x: 0, y: 0, zoom: 2, offset: { x: 0, y: 0 } };

    const left = project({ pose, point: { x: -10, y: 0 }, viewport: DESKTOP });
    const right = project({ pose, point: { x: 10, y: 0 }, viewport: DESKTOP });
    expect(right.x - left.x).toBeCloseTo(40, 0);
  });

  it("never looks from under the system", () => {
    const placement = getCameraPlacement({
      pose: getHomePose(DESKTOP),
      angle: HOME_ANGLE,
      viewport: DESKTOP,
    });

    expect(placement.position[1]).toBeGreaterThan(0);
  });
});

describe("getDistanceLimits", () => {
  it("lets the visitor zoom in and out around every framing, home, planets and ship", () => {
    for (const viewport of [DESKTOP, PHONE]) {
      const limits = getDistanceLimits(viewport);
      const framings = [
        getHomePose(viewport),
        getPlanetPose({ viewport, planetPosition: { x: 0, y: 0 }, reach: 1 }),
        getShipCameraPose({ viewport, shipPosition: { x: 0, y: 0 } }),
      ];

      for (const pose of framings) {
        const distance = getCameraDistance({ viewport, zoom: pose.zoom });
        expect(distance).toBeGreaterThan(limits.min);
        expect(distance).toBeLessThan(limits.max);
      }
    }
  });
});

describe("getCameraAngle", () => {
  it("reads back the angle a placement looks from", () => {
    const angle = { polar: 1.1, azimuth: -2.3 };
    const placement = getCameraPlacement({
      pose: { x: 40, y: -70, zoom: 2, offset: { x: -300, y: 20 } },
      angle,
      viewport: DESKTOP,
    });
    const [x, y, z] = placement.position;
    const [targetX, targetY, targetZ] = placement.target;

    const readBack = getCameraAngle({ x: x - targetX, y: y - targetY, z: z - targetZ });
    expect(readBack.polar).toBeCloseTo(angle.polar);
    expect(readBack.azimuth).toBeCloseTo(angle.azimuth);
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

describe("getShipCameraAngle", () => {
  // The cockpit's windshield: the screen above its console, which is shorter on phones.
  function getWindshield(viewport: typeof DESKTOP) {
    return { left: 0.05, right: 0.95, top: 0.06, bottom: viewport.width < 720 ? 0.68 : 0.53 };
  }

  type CountParams = { viewport: typeof DESKTOP; shipTime: number; planetTime: number };

  function countPlanetsInView({ viewport, shipTime, planetTime }: CountParams) {
    const ship = getShipPose(getShipAngle(shipTime));
    const pose = getShipCameraPose({ viewport, shipPosition: ship });
    const angle = getShipCameraAngle(ship);
    const windshield = getWindshield(viewport);

    return SOLAR_SYSTEM.filter((planet) => {
      const onScreen = project({
        pose,
        angle,
        viewport,
        point: getOrbitPosition({
          radius: planet.orbit.radius,
          phase: getOrbitAngle({ planet, time: planetTime }),
        }),
      });
      return (
        onScreen.x > viewport.width * windshield.left &&
        onScreen.x < viewport.width * windshield.right &&
        onScreen.y > viewport.height * windshield.top &&
        onScreen.y < viewport.height * windshield.bottom
      );
    }).length;
  }

  it("looks from behind the ship in toward the sun, straight ahead of it", () => {
    const ship = getShipPose(1);
    const pose = getShipCameraPose({ viewport: DESKTOP, shipPosition: ship });

    const sun = project({
      pose,
      angle: getShipCameraAngle(ship),
      viewport: DESKTOP,
      point: { x: 0, y: 0 },
    });
    expect(sun.x).toBeCloseTo(720);
    expect(sun.y).toBeLessThan(900 * 0.86);
  });

  it("usually shows a planet or two through the windshield, on desktop and phones", () => {
    for (const viewport of [DESKTOP, PHONE, { width: 360, height: 740 }]) {
      // Ten laps of the ship, the planets anywhere on their orbits when the cockpit opens.
      const counts = Array.from({ length: 200 }, (_, step) =>
        countPlanetsInView({ viewport, shipTime: step * 3.5, planetTime: step * 37.3 }),
      );

      expect(counts.filter((count) => count >= 1).length / counts.length).toBeGreaterThan(0.85);
      const average = counts.reduce((sum, count) => sum + count, 0) / counts.length;
      expect(average).toBeGreaterThan(1);
      expect(average).toBeLessThan(3);
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
  const from = { x: 0, y: 0, zoom: 1, offset: { x: 0, y: 0 } };
  const to = { x: 100, y: 0, zoom: 4, offset: { x: -360, y: 0 } };
  const anchor = { x: 100, y: 0 };

  it("starts at the first pose and lands on the second", () => {
    expect(mixPoses({ from, to, anchor, progress: 0 })).toEqual(from);
    expect(mixPoses({ from, to, anchor, progress: 1 })).toEqual(to);
  });

  it("zooms on a log scale and moves the anchor straight across the screen", () => {
    // Halfway: zoom 2 (between 1 and 4 on a log scale); the anchor sits halfway between 100px
    // right of center and 360px left of it: 130px left.
    const pose = mixPoses({ from, to, anchor, progress: 0.5 });

    expect(pose.zoom).toBeCloseTo(2);
    expect(pose.offset.x).toBeCloseTo(-180);
    expect((anchor.x - pose.x) * pose.zoom + pose.offset.x).toBeCloseTo(-130);
    expect(pose.y).toBeCloseTo(0);
  });
});

describe("mixAngles", () => {
  it("turns the short way round", () => {
    const angle = mixAngles({
      from: { polar: 0.4, azimuth: 3 },
      to: { polar: 0.8, azimuth: -3 },
      progress: 0.5,
    });

    expect(angle.polar).toBeCloseTo(0.6);
    expect(Math.cos(angle.azimuth)).toBeCloseTo(-1);
  });
});
