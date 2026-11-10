import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("PaletteSwatches", () => {
  it("shows gh44's 8 hues, one value each", async () => {
    await renderAt("/gh44-theme");

    const palette = screen.getByRole("list", { name: "palette" });
    expect(
      within(palette)
        .getAllByRole("listitem")
        .map((swatch) => swatch.textContent),
    ).toEqual([
      "clay #c59172",
      "ochre #d4b25e",
      "sage #9ebf7a",
      "seafoam #5cb8a2",
      "sky #75addb",
      "lavender #c1a0f4",
      "rose #f08ba2",
      "red #fd5d62",
    ]);
    expect(screen.queryByRole("button", { name: "vivid" })).not.toBeInTheDocument();
  });
});
