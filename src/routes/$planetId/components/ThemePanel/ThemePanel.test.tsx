import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

const APPS = ["zed", "warp", "slack", "linear", "chrome", "github", "shadcn/ui"];

function getAppTabs() {
  return within(screen.getByRole("tablist", { name: "apps" }));
}

// The open app's steps, in order.
function getStepNames(app: string) {
  const steps = screen.getByRole("list", { name: `install gh44 in ${app}` });
  return within(steps)
    .getAllByRole("listitem")
    .map((step) => step.querySelector("dfn")?.textContent);
}

describe("ThemePanel", () => {
  it("has a tab per app, zed first", async () => {
    await renderAt("/gh44-theme");

    expect(
      getAppTabs()
        .getAllByRole("tab")
        .map((tab) => tab.textContent),
    ).toEqual(APPS);
    expect(getAppTabs().getByRole("tab", { name: "zed" })).toHaveAttribute("aria-selected", "true");
    expect(getStepNames("zed")).toEqual(["install", "pick", "settings"]);
  });

  it("opens the app the URL names, with its README steps", async () => {
    await renderAt("/gh44-theme?app=warp");

    expect(getAppTabs().getByRole("tab", { name: "warp" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(getStepNames("warp")).toEqual(["copy", "pick", "font"]);
    expect(screen.getByRole("tabpanel", { name: "warp" })).toHaveTextContent(
      "mkdir -p ~/.warp/themes && cp warp/*.yaml ~/.warp/themes/",
    );
  });

  it("falls back to the first app for an app it does not know", async () => {
    await renderAt("/gh44-theme?app=notepad");

    expect(getAppTabs().getByRole("tab", { name: "zed" })).toHaveAttribute("aria-selected", "true");
  });

  it("puts the chosen app in the URL, and shows its lines for dark and light", async () => {
    const user = userEvent.setup();
    const { router } = await renderAt("/gh44-theme");

    await user.click(getAppTabs().getByRole("tab", { name: "slack" }));

    expect(router.state.location.search).toEqual({ app: "slack" });
    expect(getStepNames("slack")).toEqual(["mode", "import", "paste"]);
    const slack = screen.getByRole("tabpanel", { name: "slack" });
    expect(slack).toHaveTextContent(
      "#202124,#26282A,#34363B,#DFE1E5,#26282A,#DFE1E5,#9EBF7A,#B64309,#191A1C,#DFE1E5",
    );
    await user.click(within(slack).getByRole("tab", { name: "gh44 light" }));
    expect(slack).toHaveTextContent(
      "#F2ECE5,#EAE2D9,#D9CDC0,#2B2D30,#EAE2D9,#2B2D30,#4C7B1D,#B64309,#FAF7F3,#2B2D30",
    );
  });

  it("installs shadcn/ui from the gh44 registry, or only its colors", async () => {
    await renderAt("/gh44-theme?app=shadcn");

    const shadcn = screen.getByRole("tabpanel", { name: "shadcn/ui" });
    expect(shadcn).toHaveTextContent(
      "npx shadcn@latest add https://raw.githubusercontent.com/gentrithalili1/gh44-theme/main/shadcn/r/gh44.json",
    );
    expect(shadcn).toHaveTextContent(
      "npx shadcn@latest add https://raw.githubusercontent.com/gentrithalili1/gh44-theme/main/shadcn/r/gh44-theme.json",
    );
  });
});
