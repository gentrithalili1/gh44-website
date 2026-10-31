import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";
import { THEME_STORAGE_KEY } from "#/utils/theme";

const PLANET_LINKS = [
  { name: "me", href: "/me" },
  { name: "work", href: "/work" },
  { name: "gh44-brain", href: "/gh44-brain" },
  { name: "gh44-theme", href: "/gh44-theme" },
  { name: "confirm()", href: "/confirm" },
];

describe("SolarSystem", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    localStorage.clear();
  });

  it("links every planet to its page", async () => {
    await renderAt("/");

    const planets = screen.getByRole("navigation", { name: "planets" });
    expect(
      within(planets)
        .getAllByRole("link")
        .map((link) => ({ name: link.textContent, href: link.getAttribute("href") })),
    ).toEqual(PLANET_LINKS);
    expect(within(planets).getByText("8 moons · 2016 → now")).toBeInTheDocument();
    expect(within(planets).getByText("one theme, 7 tools")).toBeInTheDocument();
  });

  it("turns the sun on and off, and remembers the choice", async () => {
    const user = userEvent.setup();
    await renderAt("/");

    await user.click(screen.getByRole("button", { name: "turn off the sun" }));

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    await user.click(screen.getByRole("button", { name: "turn on the sun" }));

    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("marks the open planet current and fades the others", async () => {
    await renderAt("/work");

    const planets = screen.getByRole("navigation", { name: "planets" });
    const work = within(planets).getByRole("link", { name: "work" });
    expect(work).toHaveAttribute("aria-current", "page");
    for (const link of within(planets).getAllByRole("link")) {
      if (link === work) continue;
      expect(link).not.toHaveAttribute("aria-current");
      expect(link).toHaveAttribute("data-state", "faded");
    }
  });

  it("fades no planet on a page that is not a planet", async () => {
    await renderAt("/pluto");

    const planets = screen.getByRole("navigation", { name: "planets" });
    for (const link of within(planets).getAllByRole("link")) {
      expect(link).toHaveAttribute("data-state", "idle");
    }
  });
});
