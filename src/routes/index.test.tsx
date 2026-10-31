import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("HomePage", () => {
  it("names Gentrit in a visually hidden heading", async () => {
    await renderAt("/");

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "gentrit halili, senior frontend engineer",
    });
    expect(heading).toHaveClass("sr-only");
  });
});
