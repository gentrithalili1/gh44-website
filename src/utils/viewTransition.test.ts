import { describe, expect, it } from "vitest";

import { resolveViewTransitionTypes, VIEW_TRANSITION_TYPES } from "./viewTransition";

describe("resolveViewTransitionTypes", () => {
  it("tags a navigation to another page with its type", () => {
    expect(
      resolveViewTransitionTypes({ type: VIEW_TRANSITION_TYPES.menu, pathChanged: true }),
    ).toEqual(["menu"]);
  });

  it("skips the transition when the page stays the same", () => {
    expect(
      resolveViewTransitionTypes({ type: VIEW_TRANSITION_TYPES.page, pathChanged: false }),
    ).toBe(false);
  });
});
