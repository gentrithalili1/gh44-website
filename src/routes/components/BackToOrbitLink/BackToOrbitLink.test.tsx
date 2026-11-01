import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("BackToOrbitLink", () => {
  it("takes a planet page back home", async () => {
    const user = userEvent.setup();
    await renderAt("/work");

    await user.click(screen.getByRole("link", { name: "back to orbit" }));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "gentrit halili, senior frontend engineer",
      }),
    ).toBeInTheDocument();
  });
});
