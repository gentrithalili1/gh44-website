import { describe, expect, it } from "vitest";

import { findPlanet } from "#/utils/planets";

import { getShipAngle, getShipPose } from "./ship";

function getOrbitRadius(id: string) {
  const planet = findPlanet(id);
  if (!planet) throw new Error(`No planet ${id}`);
  return planet.orbit.radius;
}

describe("getShipPose", () => {
  it("keeps the ship on its own orbit, between Mars' and Jupiter's", () => {
    for (const angle of [0, 1, 2.5, 4, 5.5]) {
      const pose = getShipPose(angle);
      const distance = Math.hypot(pose.x, pose.y);

      expect(distance).toBeGreaterThan(getOrbitRadius("gh44-confirm"));
      expect(distance).toBeLessThan(getOrbitRadius("work"));
    }
  });

  it("points the nose along its direction of travel", () => {
    const now = getShipPose(getShipAngle(10));
    const later = getShipPose(getShipAngle(10.01));
    const travel = Math.atan2(later.x - now.x, -(later.y - now.y));
    const turn = Math.atan2(Math.sin(travel - now.heading), Math.cos(travel - now.heading));

    expect(turn).toBeCloseTo(0, 2);
  });
});

describe("getShipAngle", () => {
  it("moves the ship around the sun as the scene clock runs", () => {
    expect(getShipAngle(0)).not.toBeCloseTo(getShipAngle(5));
  });

  it("orbits slower than Mars and faster than Jupiter, one lap in about a minute", () => {
    const lapSeconds = (2 * Math.PI) / (getShipAngle(1) - getShipAngle(0));

    expect(lapSeconds).toBeGreaterThan(50);
    expect(lapSeconds).toBeLessThan(90);
  });
});
