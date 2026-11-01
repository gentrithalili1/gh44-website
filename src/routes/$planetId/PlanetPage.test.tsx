import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

const PROJECTS = [
  {
    path: "/gh44-brain",
    name: "gh44-brain",
    lede: "clone it once and every claude code session works the way i do.",
    repo: "https://github.com/gentrithalili1/gh44-brain",
  },
  {
    path: "/gh44-theme",
    name: "gh44-theme",
    lede: "one palette for every tool i open. zed, warp, slack, linear, chrome, github, shadcn.",
    repo: "https://github.com/gentrithalili1/gh44-theme",
  },
  {
    path: "/confirm",
    name: "confirm()",
    lede: "react confirmation dialogs you can await. resolve means yes.",
    repo: "https://github.com/gentrithalili1/react-promise-confirmation-dialog",
  },
] as const;

import { renderAt } from "#/test/renderAt";

describe("PlanetPage", () => {
  it("lists the 8 roles on work, most recent first, with JOIN marked now", async () => {
    await renderAt("/work");

    expect(screen.getByRole("heading", { level: 1, name: "work" })).toBeInTheDocument();
    const roles = within(screen.getByRole("list", { name: "roles" })).getAllByRole("listitem");
    expect(roles.map((role) => role.textContent)).toEqual([
      "JOINSenior Frontend Engineer · Feb 2026 – now",
      "Belt SoftwareSenior Frontend Engineer · Aug 2023 – Feb 2026",
      "PovioSenior Frontend Engineer · Aug 2021 – Sep 2023",
      "Beetroot Academy KosovoAdvanced JavaScript Trainer · Jun 2020 – Aug 2023",
      "Kutia Digital AgencyFrontend Developer & Team Lead · Mar 2019 – Aug 2021",
      "ATIS Digital AgencyJavaScript Developer · Feb 2018 – Mar 2019",
      "UBTJavaScript Developer · Mar 2017 – Feb 2018",
      "RrotaWeb Developer Intern · Oct 2016 – Jan 2017",
    ]);
  });

  it("introduces Gentrit on me, with his profiles", async () => {
    await renderAt("/me");

    expect(screen.getByRole("heading", { level: 1, name: "gentrit halili" })).toBeInTheDocument();
    expect(
      screen.getByText("senior frontend engineer in pristina, kosovo. occasionally in orbit."),
    ).toBeInTheDocument();
    const contact = screen.getByRole("list", { name: "contact" });
    expect(
      within(contact)
        .getAllByRole("link")
        .map((link) => ({ name: link.textContent, href: link.getAttribute("href") })),
    ).toEqual([
      {
        name: "write in gmail (opens in new tab)",
        href: "https://mail.google.com/mail/?view=cm&to=gentrithalili11@gmail.com&su=hi%20gentrit",
      },
      {
        name: "gentrithalili1, github (opens in new tab)",
        href: "https://github.com/gentrithalili1/",
      },
      {
        name: "gentrithalili11, linkedin (opens in new tab)",
        href: "https://www.linkedin.com/in/gentrithalili11/",
      },
      {
        name: "gentrithalili_, instagram (opens in new tab)",
        href: "https://www.instagram.com/gentrithalili_/",
      },
    ]);
  });

  it("copies the email on me and says so", async () => {
    const user = userEvent.setup();
    await renderAt("/me");

    await user.click(screen.getByRole("button", { name: "gentrithalili11@gmail.com" }));

    await expect(navigator.clipboard.readText()).resolves.toBe("gentrithalili11@gmail.com");
    expect(screen.getByRole("button", { name: "copied. talk soon." })).toBeInTheDocument();
  });

  it.each(PROJECTS)("shows $name with its lede and repo", async ({ path, name, lede, repo }) => {
    await renderAt(path);

    expect(screen.getByRole("heading", { level: 1, name })).toBeInTheDocument();
    expect(screen.getByText(lede)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /opens in new tab/ })).toHaveAttribute("href", repo);
  });

  it("shows the 404 for a planet that does not exist", async () => {
    await renderAt("/pluto");

    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
  });

  it("takes the page title from the planet", async () => {
    await renderAt("/work");

    expect(document.title).toBe("Work: Gentrit Halili's Roles Since 2016 | gh44.dev");
  });

  it("goes back to orbit from the back link", async () => {
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

  it("goes back to orbit on Esc", async () => {
    const user = userEvent.setup();
    await renderAt("/work");

    await user.keyboard("{Escape}");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "gentrit halili, senior frontend engineer",
      }),
    ).toBeInTheDocument();
  });
});
