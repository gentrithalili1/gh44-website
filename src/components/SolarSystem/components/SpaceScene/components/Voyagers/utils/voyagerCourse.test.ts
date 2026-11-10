import { describe, expect, it } from "vitest";

import { SOLAR_SYSTEM } from "#/utils/planets";

import {
  getCourseShare,
  getVoyagerFade,
  getVoyagerPosition,
  VOYAGER_COURSES,
} from "./voyagerCourse";

const [VOYAGER_1, VOYAGER_2] = VOYAGER_COURSES;

describe("voyagerCourse", () => {
  it("heads each probe straight out, one above the planets' plane and one below", () => {
    for (const course of VOYAGER_COURSES) {
      expect(Math.hypot(...course.heading)).toBeCloseTo(1, 2);
    }
    expect(VOYAGER_1.heading[1]).toBeGreaterThan(0);
    expect(VOYAGER_2.heading[1]).toBeLessThan(0);
  });

  it("keeps both past every planet, moving away from the sun", () => {
    const farthest = Math.max(...SOLAR_SYSTEM.map((planet) => planet.orbit.radius + planet.size));
    for (const course of VOYAGER_COURSES) {
      const near = Math.hypot(...getVoyagerPosition({ course, share: 0 }));
      const far = Math.hypot(...getVoyagerPosition({ course, share: 1 }));

      expect(near).toBeGreaterThan(farthest);
      expect(far).toBeGreaterThan(near);
    }
  });

  it("moves on with the scene clock and starts over at the end", () => {
    const start = getCourseShare({ course: VOYAGER_2, time: 0 });
    const later = getCourseShare({ course: VOYAGER_2, time: 60 });

    expect(start).toBe(0);
    expect(later).toBeGreaterThan(start);
    expect(getCourseShare({ course: VOYAGER_2, time: 100_000 })).toBeLessThan(1);
    expect(getCourseShare({ course: VOYAGER_1, time: 0 })).not.toBe(start);
  });

  it("fades a probe in at the start of its course and out at the end", () => {
    expect(getVoyagerFade(0)).toBe(0);
    expect(getVoyagerFade(0.5)).toBe(1);
    expect(getVoyagerFade(1)).toBe(0);
  });
});
