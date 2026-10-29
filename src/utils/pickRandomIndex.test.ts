import { afterEach, describe, expect, it, vi } from "vitest";

import { pickRandomIndex } from "./pickRandomIndex";

describe("pickRandomIndex", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips the excluded index", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    expect(pickRandomIndex({ count: 5, excludeIndex: 2 })).toBe(3);
  });

  it("keeps indexes below the excluded one", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(pickRandomIndex({ count: 5, excludeIndex: 2 })).toBe(0);
  });

  it("can reach the last index", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);

    expect(pickRandomIndex({ count: 5, excludeIndex: 2 })).toBe(4);
  });
});
