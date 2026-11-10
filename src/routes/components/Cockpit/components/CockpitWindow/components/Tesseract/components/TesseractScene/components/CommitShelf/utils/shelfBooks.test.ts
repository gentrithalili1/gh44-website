import { describe, expect, it } from "vitest";

import { getBookPositions, getShelfSize, SHELF_ROWS } from "./shelfBooks";

describe("getBookPositions", () => {
  it("stands every book on the shelf, row by row from the top left", () => {
    const positions = getBookPositions({ count: 10 });
    const [first, second] = positions;
    const fourth = positions[3];

    expect(positions).toHaveLength(10);
    expect(second?.[0]).toBeGreaterThan(first?.[0] ?? 0);
    expect(second?.[1]).toBe(first?.[1]);
    // Three columns for ten books in four rows: the fourth book starts the second row.
    expect(fourth?.[0]).toBe(first?.[0]);
    expect(fourth?.[1]).toBeLessThan(first?.[1] ?? 0);
  });

  it("centers the shelf on its middle", () => {
    const positions = getBookPositions({ count: SHELF_ROWS * 5 });
    const xs = positions.map(([x]) => x);
    const ys = positions.map(([, y]) => y);

    expect(Math.min(...xs)).toBeCloseTo(-Math.max(...xs));
    expect(Math.min(...ys)).toBeCloseTo(-Math.max(...ys));
  });
});

describe("getShelfSize", () => {
  it("fits every book", () => {
    const size = getShelfSize({ count: 115 });
    const positions = getBookPositions({ count: 115 });

    expect(size.width).toBeGreaterThan(Math.max(...positions.map(([x]) => x)) * 2);
    expect(size.height).toBeGreaterThan(Math.max(...positions.map(([, y]) => y)) * 2);
  });
});
