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

  it("puts the theme toggle before the menu button", async () => {
    await renderAt("/");

    const themeToggle = screen.getByRole("button", { name: "Switch to dark mode" });
    const menuButton = screen.getByRole("button", { name: "Open menu" });
    expect(themeToggle.compareDocumentPosition(menuButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("changes the logo's 44 color with each greeting on the home page", async () => {
    await renderAt("/");

    const logo = screen.getByRole("link", { name: "gh44 home" });
    expect(within(logo).getByText("44")).toHaveClass("motion-safe:animate-logo-tick");
  });

  it.each([
    { path: "/work", colorClassName: "text-success" },
    { path: "/gh44-brain", colorClassName: "text-primary" },
    { path: "/gh44-theme", colorClassName: "text-warning" },
    { path: "/does-not-exist", colorClassName: "text-primary" },
  ])("colors the logo's 44 with the section color on $path", async ({ path, colorClassName }) => {
    await renderAt(path);

    const logo = screen.getByRole("link", { name: "gh44 home" });
    const accent = within(logo).getByText("44");
    expect(accent).toHaveClass(colorClassName);
    expect(accent).not.toHaveClass("motion-safe:animate-logo-tick");
  });
});
