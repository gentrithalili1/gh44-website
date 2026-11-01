import { describe, expect, it } from "vitest";

import { getSpokenText } from "./spokenText";

describe("getSpokenText", () => {
  it("says Floki with a light L", () => {
    expect(getSpokenText("Floki online. floki, FLOKI.")).toBe("Flokee online. Flokee, Flokee.");
  });

  it("leaves other words alone", () => {
    expect(getSpokenText("Flokis and refloking")).toBe("Flokis and refloking");
  });
});
