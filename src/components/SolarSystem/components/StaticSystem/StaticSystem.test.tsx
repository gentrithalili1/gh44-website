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
    // Names only: the subtitle lives in the open planet's panel.
    expect(within(planets).queryByText("8 moons · 2016 → now")).not.toBeInTheDocument();
    expect(within(planets).queryByText("one theme, 7 tools")).not.toBeInTheDocument();
  });

  it("draws all 8 planets on their orbits, and gives Mercury, Venus and Uranus no name, link or page", async () => {
    await renderAt("/");

    // The drawing is hidden from assistive tech, so it is found by test ids.
    expect(screen.getAllByTestId("planet-body")).toHaveLength(8);
    expect(screen.getAllByTestId("planet-orbit")).toHaveLength(8);

    for (const name of ["mercury", "venus", "uranus"]) {
      expect(screen.queryByText(name)).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
    }
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
