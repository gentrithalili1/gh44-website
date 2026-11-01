import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("NotFound", () => {
  it("shows the lost planet, dinosaurs and all", async () => {
    await renderAt("/pluto");

    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
    expect(
      screen.getByText("lost in space. even the dinosaurs couldn't find this page."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "a lost planet with three dinosaurs on it" }),
    ).toBeInTheDocument();
  });

  it("goes back to orbit", async () => {
    const user = userEvent.setup();
    await renderAt("/does-not-exist");

    await user.click(screen.getByRole("link", { name: "back to orbit" }));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "gentrit halili, senior frontend engineer",
      }),
    ).toBeInTheDocument();
  });
});
