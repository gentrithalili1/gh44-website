import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

const APPS = ["zed", "warp", "slack", "linear", "chrome", "github", "shadcn/ui"];

describe("ThemePanel", () => {
  it("has a tab per app, zed first", async () => {
    await renderAt("/gh44-theme");

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(APPS);
    expect(screen.getByRole("tab", { name: "zed" })).toHaveAttribute("aria-selected", "true");
  });

  it("opens the app the URL names", async () => {
    await renderAt("/gh44-theme?app=warp");

    expect(screen.getByRole("tab", { name: "warp" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "warp" })).toHaveTextContent(
      "cp warp/gh44-dark.yaml warp/gh44-light.yaml ~/.warp/themes/",
    );
  });

  it("falls back to the first app for an app it does not know", async () => {
    await renderAt("/gh44-theme?app=notepad");

    expect(screen.getByRole("tab", { name: "zed" })).toHaveAttribute("aria-selected", "true");
  });

  it("puts the chosen app in the URL", async () => {
    const user = userEvent.setup();
    const { router } = await renderAt("/gh44-theme");

    await user.click(screen.getByRole("tab", { name: "slack" }));

    expect(router.state.location.search).toEqual({ app: "slack" });
    expect(screen.getByRole("tabpanel", { name: "slack" })).toHaveTextContent(
      "#F2ECE5,#EAE2D9,#D9CDC0,#2B2D30,#EAE2D9,#2B2D30,#497C15,#B94000,#A9502F,#FAF7F3",
    );
  });

  it("installs shadcn/ui from the gh44 registry", async () => {
    await renderAt("/gh44-theme?app=shadcn");

    const shadcn = screen.getByRole("tabpanel", { name: "shadcn/ui" });
    expect(shadcn).toHaveTextContent(
      "npx shadcn@latest add https://raw.githubusercontent.com/gentrithalili1/gh44-theme/main/shadcn/r/gh44.json",
    );
    expect(shadcn).toHaveTextContent("npx shadcn@latest add @gh44/gh44");
  });
});
