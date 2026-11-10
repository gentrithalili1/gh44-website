import { describe, expect, it } from "vitest";

import {
  getPassPosition,
  IDLE_SECONDS,
  PASS_SECONDS,
  stepPass,
  type PioneerPass,
  WAITING,
} from "./pioneerPass";

function run({ pass, seconds, isIdle }: { pass: PioneerPass; seconds: number; isIdle: boolean }) {
  let current = pass;
  for (let second = 0; second < seconds; second++) {
    current = stepPass({ pass: current, delta: 1, isIdle });
  }
  return current;
}

describe("stepPass", () => {
  it("starts crossing once the visitor has been idle long enough", () => {
    expect(run({ pass: WAITING, seconds: IDLE_SECONDS - 1, isIdle: true }).status).toBe("waiting");
    expect(run({ pass: WAITING, seconds: IDLE_SECONDS, isIdle: true })).toEqual({
      status: "crossing",
      progress: 0,
    });
  });

  it("starts the wait over on any activity", () => {
    const almost = run({ pass: WAITING, seconds: IDLE_SECONDS - 1, isIdle: true });

    expect(stepPass({ pass: almost, delta: 1, isIdle: false })).toEqual(WAITING);
  });

  it("crosses whatever the visitor does, once, then stays gone", () => {
    const crossing: PioneerPass = { status: "crossing", progress: 0 };
    const gone = run({ pass: crossing, seconds: PASS_SECONDS, isIdle: false });

    expect(gone).toEqual({ status: "gone" });
    expect(run({ pass: gone, seconds: IDLE_SECONDS * 2, isIdle: true })).toEqual({
      status: "gone",
    });
  });
});

describe("getPassPosition", () => {
  it("crosses left to right at one height", () => {
    const [startX, startY] = getPassPosition(0);
    const [endX, endY] = getPassPosition(1);

    expect(startX).toBeLessThan(0);
    expect(endX).toBe(-startX);
    expect(endY).toBe(startY);
  });
});
