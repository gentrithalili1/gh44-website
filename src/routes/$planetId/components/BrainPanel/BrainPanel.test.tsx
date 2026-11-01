import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { fakeFrames, playFor, stubOnScreen, stubReducedMotion } from "#/test/motion";
import { renderAt } from "#/test/renderAt";

// The README's install line.
const INSTALL = "git clone git@github.com:gentrithalili1/gh44-brain.git && gh44-brain/install.sh";
const SESSION_LENGTH_MS = 30_000;

describe("BrainPanel", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("installs with the README's command and says what it needs", async () => {
    await renderAt("/gh44-brain");

    const install = screen.getByRole("tabpanel", { name: "install" });
    expect(install).toHaveTextContent(INSTALL);
    expect(install).toHaveTextContent("needs homebrew, node and pnpm.");
  });

  it("plays a recorded session, labeled as a replay", async () => {
    fakeFrames();
    stubReducedMotion(false);
    stubOnScreen();
    await renderAt("/gh44-brain");

    const replay = screen.getByRole("figure", { name: "replay · a recorded session, not live" });
    expect(replay).toHaveAttribute("aria-busy", "true");

    playFor(SESSION_LENGTH_MS);

    expect(replay).toHaveAttribute("aria-busy", "false");
    for (const command of ["/gh44-clarify", "/gh44-plan", "/gh44-implement", "/gh44-create-pr"]) {
      expect(replay).toHaveTextContent(command);
    }
  });

  it("plays the session again on replay", async () => {
    fakeFrames();
    const user = userEvent.setup();
    stubReducedMotion(false);
    stubOnScreen();
    await renderAt("/gh44-brain");
    const replay = screen.getByRole("figure", { name: "replay · a recorded session, not live" });
    playFor(SESSION_LENGTH_MS);

    await user.click(within(replay).getByRole("button", { name: "replay the session" }));

    expect(replay).toHaveAttribute("aria-busy", "true");
    playFor(SESSION_LENGTH_MS);
    expect(replay).toHaveAttribute("aria-busy", "false");
  });

  it("shows the whole session at once when the visitor reduces motion", async () => {
    stubReducedMotion(true);
    stubOnScreen();
    await renderAt("/gh44-brain");

    const replay = screen.getByRole("figure", { name: "replay · a recorded session, not live" });
    expect(replay).toHaveAttribute("aria-busy", "false");
    expect(replay).toHaveTextContent("/gh44-create-pr");
  });

  it("lists the learning loop in its 5 steps", async () => {
    await renderAt("/gh44-brain");

    const loop = screen.getByRole("list", { name: "learning loop" });
    expect(
      within(loop)
        .getAllByRole("listitem")
        .map((step) => within(step).getByRole("term").textContent),
    ).toEqual(["capture", "learn", "ingest", "tidy", "retro"]);
  });
});
