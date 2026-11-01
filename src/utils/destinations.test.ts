import { describe, expect, it } from "vitest";

import { DESTINATIONS } from "./destinations";

describe("DESTINATIONS", () => {
  it("lists every planet page with its route and description, from the sun outward", () => {
    expect(DESTINATIONS).toEqual([
      { name: "me", route: "/me", description: "who, where, how to reach" },
      { name: "gh44-confirm", route: "/gh44-confirm", description: "promise based react dialogs" },
      { name: "work", route: "/work", description: "8 moons · 2016 → now" },
      { name: "gh44-theme", route: "/gh44-theme", description: "one theme, 7 tools" },
      { name: "gh44-brain", route: "/gh44-brain", description: "claude code, my way" },
    ]);
  });
});
