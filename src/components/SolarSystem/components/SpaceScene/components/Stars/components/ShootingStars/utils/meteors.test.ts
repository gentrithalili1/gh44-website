import { describe, expect, it } from "vitest";

import {
  createMeteors,
  isInShower,
  launchShower,
  launchSingle,
  METEOR_SLOTS,
  stepMeteor,
  writeMeteorOutline,
} from "./meteors";

const VIEWPORT = { width: 1440, height: 900 };

// The same numbers every run.
function createRandom(seed = 1) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

describe("isInShower", () => {
  it("skips the single shooting star every 10 seconds, where a shower lands", () => {
    expect([5, 10, 15, 20, 25, 30].map((time) => isInShower(time))).toEqual([
      false,
      true,
      false,
      true,
      false,
      true,
    ]);
  });
});

// Which quarter of the compass a heading points to: right, down, left or up (`y` down).
function getQuarter(angle: number) {
  return Math.round((angle + 2 * Math.PI) / (Math.PI / 2)) % 4;
}

describe("launchSingle", () => {
  it("sends one bright shooting star from somewhere on screen", () => {
    const [single] = createMeteors();
    if (!single) throw new Error("No meteor");
    launchSingle({ meteor: single, viewport: VIEWPORT, random: createRandom() });

    expect(single.life).toBe(1);
    expect(single.delay).toBe(0);
    expect(single.x).toBeGreaterThanOrEqual(0);
    expect(single.x).toBeLessThanOrEqual(VIEWPORT.width);
    expect(single.y).toBeGreaterThanOrEqual(0);
    expect(single.y).toBeLessThanOrEqual(VIEWPORT.height);
  });

  it("heads every way across the sky, not one way", () => {
    const random = createRandom(3);
    const quarters = new Set(
      Array.from({ length: 40 }, () => {
        const [single] = createMeteors();
        if (!single) throw new Error("No meteor");
        launchSingle({ meteor: single, viewport: VIEWPORT, random });
        return getQuarter(Math.atan2(single.vy, single.vx));
      }),
    );

    expect([...quarters].sort()).toEqual([0, 1, 2, 3]);
  });
});

describe("launchShower", () => {
  it("sends 5 to 8 meteors from one radiant, roughly parallel, over 1.5 seconds", () => {
    for (const seed of [1, 7, 42, 99]) {
      const meteors = createMeteors();
      const { count, radiant } = launchShower({
        meteors,
        viewport: VIEWPORT,
        random: createRandom(seed),
      });
      const shower = meteors.filter((meteor) => meteor.life > 0);

      expect(count).toBeGreaterThanOrEqual(5);
      expect(count).toBeLessThanOrEqual(8);
      expect(shower).toHaveLength(count);
      const headings = shower.map((meteor) => Math.atan2(meteor.vy, meteor.vx));
      const [first = 0] = headings;
      for (const heading of headings) {
        // The angle between them, wrapped to [-π, π].
        const turn = Math.atan2(Math.sin(heading - first), Math.cos(heading - first));
        expect(Math.abs(turn)).toBeLessThan(0.3);
      }
      for (const meteor of shower) {
        // Each flies straight out of the radiant.
        const away = { x: meteor.x - radiant.x, y: meteor.y - radiant.y };
        const cross = away.x * meteor.vy - away.y * meteor.vx;
        expect(
          Math.abs(cross) / (Math.hypot(away.x, away.y) * Math.hypot(meteor.vx, meteor.vy)),
        ).toBeLessThan(1e-9);
        expect(meteor.delay).toBeGreaterThanOrEqual(0);
        expect(meteor.delay).toBeLessThanOrEqual(1.5);
      }
      expect(
        new Set(shower.map((meteor) => Math.round(Math.hypot(meteor.vx, meteor.vy)))).size,
      ).toBeGreaterThan(1);
    }
  });

  it("streams in from every side of the screen, toward it", () => {
    const random = createRandom(5);
    const sides = new Set(
      Array.from({ length: 40 }, () => {
        const meteors = createMeteors();
        const { radiant } = launchShower({ meteors, viewport: VIEWPORT, random });
        const [meteor] = meteors.filter((candidate) => candidate.life > 0);
        if (!meteor) throw new Error("No meteor");
        // Out of the radiant, toward the screen's middle.
        const toCenter = { x: VIEWPORT.width / 2 - radiant.x, y: VIEWPORT.height / 2 - radiant.y };
        expect(toCenter.x * meteor.vx + toCenter.y * meteor.vy).toBeGreaterThan(0);
        return getQuarter(
          Math.atan2(radiant.y - VIEWPORT.height / 2, radiant.x - VIEWPORT.width / 2),
        );
      }),
    );

    expect([...sides].sort()).toEqual([0, 1, 2, 3]);
  });

  it("leaves the single shooting star's slot alone", () => {
    const meteors = createMeteors();
    launchShower({ meteors, viewport: VIEWPORT, random: createRandom() });

    expect(meteors).toHaveLength(METEOR_SLOTS);
    expect(meteors[0]?.life).toBe(0);
  });
});

describe("stepMeteor", () => {
  it("holds a meteor back until its turn, then moves it and fades it out in about a second", () => {
    const [meteor] = createMeteors();
    if (!meteor) throw new Error("No meteor");
    Object.assign(meteor, { x: 0, y: 0, vx: 500, vy: 100, life: 1, delay: 0.5 });

    stepMeteor({ meteor, delta: 0.25 });
    expect(meteor).toMatchObject({ x: 0, y: 0, life: 1 });

    stepMeteor({ meteor, delta: 0.5 });
    expect(meteor.x).toBeGreaterThan(0);
    for (let step = 0; step < 12; step++) stepMeteor({ meteor, delta: 0.1 });
    expect(meteor.life).toBe(0);
  });
});

describe("writeMeteorOutline", () => {
  it("draws a streak wide at its head, narrowing to a point well behind it", () => {
    const [meteor] = createMeteors();
    if (!meteor) throw new Error("No meteor");
    Object.assign(meteor, { x: 300, y: 100, vx: 540, vy: 180, tailSeconds: 0.22, life: 1 });
    const positions = new Float32Array(METEOR_SLOTS * 12);
    writeMeteorOutline({ meteor, positions, slot: 1 });

    const corner = (index: number) => ({
      x: positions[12 + index * 3] ?? Number.NaN,
      y: positions[12 + index * 3 + 1] ?? Number.NaN,
    });
    expect(Math.hypot(corner(0).x - corner(1).x, corner(0).y - corner(1).y)).toBeCloseTo(1.6);
    expect(corner(2)).toEqual(corner(3));
    expect(corner(2).x).toBeCloseTo(300 - 540 * 0.22, 3);
    expect(corner(2).y).toBeCloseTo(100 - 180 * 0.22, 3);
    // Slot 0 stays untouched.
    expect(positions.slice(0, 12).every((value) => value === 0)).toBe(true);
  });
});
