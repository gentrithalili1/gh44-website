import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

// Real solar-system order, outward from the sun.
const PLANET_LINKS = [
  { name: "me", href: "/me" },
  { name: "gh44-confirm", href: "/confirm" },
  { name: "work", href: "/work" },
  { name: "gh44-theme", href: "/gh44-theme" },
  { name: "gh44-brain", href: "/gh44-brain" },
];

describe("StaticSystem", () => {
  it("links every planet to its page, in real order", async () => {
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

  it("keeps the sun decorative: nothing to press or read", async () => {
    await renderAt("/");

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText(/sun/)).not.toBeInTheDocument();
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
