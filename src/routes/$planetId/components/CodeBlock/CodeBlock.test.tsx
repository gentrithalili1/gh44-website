import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { fakeFrames, playFor, stubOnScreen, stubReducedMotion } from "#/test/motion";
import { renderAt } from "#/test/renderAt";

const BRAIN_INSTALL =
  "git clone git@github.com:gentrithalili1/gh44-brain.git && gh44-brain/install.sh";

describe("CodeBlock", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows the install command, highlighted in the gh44 palette", async () => {
    await renderAt("/gh44-brain");

    const install = screen.getByRole("tab", { name: "install" });
    expect(install).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel", { name: "install" });
    expect(panel).toHaveTextContent(BRAIN_INSTALL);
    // Strings in sage, as gh44 for zed colors them.
    expect(within(panel).getByText("git@github.com:gentrithalili1/gh44-brain.git")).toHaveStyle({
      color: "#9ebf7a",
    });
  });

  it("copies the plain code and says so", async () => {
    const user = userEvent.setup();
    await renderAt("/gh44-brain");

    await user.click(screen.getByRole("button", { name: "copy code" }));

    await expect(navigator.clipboard.readText()).resolves.toBe(BRAIN_INSTALL);
    expect(screen.getByRole("status")).toHaveTextContent("copied");
  });

  it("switches tabs with the arrow keys", async () => {
    const user = userEvent.setup();
    await renderAt("/gh44-theme?app=slack");

    await user.click(screen.getByRole("tab", { name: "gh44 dark" }));
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "gh44 light" })).toHaveFocus();
    expect(screen.getByRole("tabpanel", { name: "gh44 light" })).toHaveTextContent("#F2ECE5");

    await user.keyboard("{Home}");

    expect(screen.getByRole("tab", { name: "gh44 dark" })).toHaveFocus();
  });

  it("types the code in the first time it comes on screen", async () => {
    fakeFrames();
    stubReducedMotion(false);
    stubOnScreen();
    await renderAt("/gh44-brain");

    const panel = screen.getByRole("tabpanel", { name: "install" });
    expect(panel).toHaveAttribute("aria-busy", "true");
    playFor(1500);
    expect(panel).toHaveAttribute("aria-busy", "false");
  });

  it("shows the code at once when the visitor reduces motion", async () => {
    stubReducedMotion(true);
    stubOnScreen();
    await renderAt("/gh44-brain");

    const panel = screen.getByRole("tabpanel", { name: "install" });
    expect(panel).toHaveAttribute("aria-busy", "false");
    expect(panel).toHaveTextContent(BRAIN_INSTALL);
  });
});
