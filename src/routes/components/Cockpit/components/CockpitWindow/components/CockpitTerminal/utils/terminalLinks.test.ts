import { describe, expect, it } from "vitest";

import { getLineSegments } from "./terminalLinks";

function describeSegments(text: string) {
  return getLineSegments(text).map((segment) =>
    segment.kind === "text" ? segment.text : `[${segment.destination.route}]`,
  );
}

describe("getLineSegments", () => {
  it("links every destination in a list", () => {
    expect(
      describeSegments("destinations: me, gh44-confirm, work, gh44-theme, gh44-brain"),
    ).toEqual([
      "destinations: ",
      "[/me]",
      ", ",
      "[/gh44-confirm]",
      ", ",
      "[/work]",
      ", ",
      "[/gh44-theme]",
      ", ",
      "[/gh44-brain]",
    ]);
  });

  it("links the name at the start of a table row", () => {
    expect(describeSegments("  work              8 moons · 2016 → now")).toEqual([
      "  ",
      "[/work]",
      "              8 moons · 2016 → now",
    ]);
  });

  it("leaves names inside other words and routes as plain text", () => {
    expect(describeSegments("route: /work")).toEqual(["route: /work"]);
    expect(describeSegments("gh44-themes and homework")).toEqual(["gh44-themes and homework"]);
    expect(describeSegments("who built this ship")).toEqual(["who built this ship"]);
  });
});
