import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("HomePage", () => {
  it("introduces Gentrit by name", async () => {
    await renderAt("/");

    expect(
      screen.getByRole("heading", { level: 1, name: "Hi, I'm Gentrit Halili" }),
    ).toBeInTheDocument();
  });

  it("links to email and, in a new tab, the 3 profiles", async () => {
    await renderAt("/");

    const contacts = screen.getByRole("list", { name: "Contact" });
    const links = within(contacts).getAllByRole("link");
    expect(
      links.map((link) => ({
        name: link.textContent,
        href: link.getAttribute("href"),
        target: link.getAttribute("target"),
      })),
    ).toEqual([
      { name: "email", href: "mailto:gentrithalili11@gmail.com", target: null },
      {
        name: "GitHub (opens in new tab)",
        href: "https://github.com/gentrithalili1/",
        target: "_blank",
      },
      {
        name: "LinkedIn (opens in new tab)",
        href: "https://www.linkedin.com/in/gentrithalili11/",
        target: "_blank",
      },
      {
        name: "Instagram (opens in new tab)",
        href: "https://www.instagram.com/gentrithalili_/",
        target: "_blank",
      },
    ]);
  });

  it("sets the tab title", async () => {
    await renderAt("/");

    expect(document.title).toBe("Gentrit Halili, Senior Software Engineer | gh44.dev");
  });
});
