import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderInRouter } from "#/test/renderInRouter";

import { CockpitTerminal } from "./CockpitTerminal";

function getOutput() {
  return within(screen.getByRole("log", { name: "terminal output" }));
}

describe("CockpitTerminal", () => {
  it("runs go for a destination clicked in the output", async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={onGo} /> });

    await user.click(getOutput().getByRole("link", { name: "gh44-theme" }));

    expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/gh44-theme" }));
    expect(screen.getByRole("log", { name: "terminal output" })).toHaveTextContent(
      "gh44@explorer:~$ go gh44-theme",
    );
  });

  it("takes no clicks on destinations once a launch is locked in", async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked onGo={onGo} /> });

    const link = getOutput().getByRole("link", { name: "work" });
    await user.click(link);

    expect(onGo).not.toHaveBeenCalled();
    expect(link).toHaveAttribute("aria-disabled", "true");
  });

  it("is a zsh window", async () => {
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    expect(screen.getByRole("region", { name: "gh44@explorer — zsh" })).toBeInTheDocument();
  });
});
