import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("HomePage", () => {
  it("introduces Gentrit with his name and role", async () => {
    await renderAt("/");

    expect(
      screen.getByRole("heading", { level: 1, name: "Hi, I'm Gentrit Halili" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
  });

  it("links to the 5 contact channels, external ones in a new tab", async () => {
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
      { name: "LinkedIn", href: "https://www.linkedin.com/in/gentrithalili", target: "_blank" },
      { name: "Instagram", href: "https://www.instagram.com/gentrithalili", target: "_blank" },
      { name: "X", href: "https://x.com/gentrithalili", target: "_blank" },
      { name: "Email", href: "mailto:hello@gh44.dev", target: null },
      { name: "GitHub", href: "https://github.com/gentrithalili1", target: "_blank" },
    ]);
  });

  it("sets the tab title", async () => {
    await renderAt("/");

    expect(document.title).toBe("Gentrit Halili, Senior Software Engineer | gh44.dev");
  });
});
