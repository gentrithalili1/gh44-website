import { describe, expect, it } from "vitest";

import { BLADE_COUNT, getBladeTurns } from "./avalonBlades";

describe("getBladeTurns", () => {
  it("sets the hulls evenly round the spine", () => {
    const turns = getBladeTurns();

    expect(turns).toHaveLength(BLADE_COUNT);
    expect(turns[0]).toBe(0);
    expect(turns[1]).toBeCloseTo((Math.PI * 2) / 3);
    expect(turns[2]).toBeCloseTo((Math.PI * 4) / 3);
  });
});
