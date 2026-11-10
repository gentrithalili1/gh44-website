import { describe, expect, it } from "vitest";

import { COMMITS } from "./commits";

describe("COMMITS", () => {
  it("lists the commits oldest first, each with a day and a subject", () => {
    expect(COMMITS.length).toBeGreaterThan(100);
    for (const commit of COMMITS) {
      expect(commit.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(commit.subject).not.toBe("");
    }
    const dates = COMMITS.map((commit) => commit.date);
    expect(dates).toEqual([...dates].sort());
  });
});
