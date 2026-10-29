import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("SiteHeader", () => {
  it("opens the menu with the hamburger button and shows the 3 sections", async () => {
    const user = userEvent.setup();
    await renderAt("/");

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const nav = screen.getByRole("navigation", { name: "Main" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Work Experience",
      "gh44-brain",
      "gh44-theme",
    ]);
  });

  it("marks the current section's menu item as the current page", async () => {
    const user = userEvent.setup();
    await renderAt("/gh44-brain");

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "gh44-brain" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: "Work Experience" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
