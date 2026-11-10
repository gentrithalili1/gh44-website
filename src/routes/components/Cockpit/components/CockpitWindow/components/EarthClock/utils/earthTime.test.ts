import { describe, expect, it } from "vitest";

import { getEarthDate } from "./earthTime";

const NOW = Date.UTC(2026, 10, 10, 16, 42, 7);

describe("getEarthDate", () => {
  it("is the ship's own date before any trip", () => {
    expect(getEarthDate({ now: NOW, yearsPassed: 0 }).getTime()).toBe(NOW);
  });

  it("adds the years the trips cost, keeping the day and the time", () => {
    const date = getEarthDate({ now: NOW, yearsPassed: 14 });

    expect(date.toISOString()).toBe("2040-11-10T16:42:07.000Z");
  });
});
