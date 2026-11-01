import { Color } from "three";
import { describe, expect, it } from "vitest";

import { getStarTint, stepStarTint } from "./starTint";

describe("getStarTint", () => {
  it("keeps the stars the foreground color, #dfe1e5, while no planet is open", () => {
    const tint = getStarTint(undefined);

    expect([tint.r * 255, tint.g * 255, tint.b * 255]).toEqual([223, 225, 229]);
  });

  it("tints the stars in the open planet's soft color", () => {
    // gh44-brain is Neptune, blue #9fb7cc.
    const tint = getStarTint("gh44-brain");

    expect([tint.r * 255, tint.g * 255, tint.b * 255]).toEqual([159, 183, 204]);
  });
});

describe("stepStarTint", () => {
  it("moves part of the way in one frame, so the change is smooth", () => {
    const tint = new Color(0, 0, 0);

    stepStarTint({ tint, target: new Color(1, 1, 1), delta: 1 / 60 });

    expect(tint.r).toBeGreaterThan(0);
    expect(tint.r).toBeLessThan(1);
  });

  it("settles exactly on the target within about a second and a half, both ways", () => {
    const toWhite = new Color(0, 0, 0);
    const toBlack = new Color(1, 1, 1);
    for (let frame = 0; frame < 90; frame++) {
      stepStarTint({ tint: toWhite, target: new Color(1, 1, 1), delta: 1 / 60 });
      stepStarTint({ tint: toBlack, target: new Color(0, 0, 0), delta: 1 / 60 });
    }

    expect(toWhite.r).toBe(1);
    expect(toBlack.r).toBe(0);
  });
});
