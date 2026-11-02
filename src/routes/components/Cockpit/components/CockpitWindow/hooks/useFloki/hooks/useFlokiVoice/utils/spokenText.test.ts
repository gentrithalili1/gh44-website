import { describe, expect, it } from "vitest";

import { getSpokenText } from "./spokenText";

describe("getSpokenText", () => {
  it("says Floki like the Vikings character, FLOH-kee", () => {
    expect(getSpokenText("Floki here. floki, FLOKI.")).toBe(
      "[[ flˈoʊki ]] here. [[ flˈoʊki ]], [[ flˈoʊki ]].",
    );
  });

  it("leaves other words alone", () => {
    expect(getSpokenText("Flokis and refloking")).toBe("Flokis and refloking");
  });
});
