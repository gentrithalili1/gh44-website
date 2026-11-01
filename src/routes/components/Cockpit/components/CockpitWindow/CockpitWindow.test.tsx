import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MusicProvider } from "#/routes/hooks/useMusic";
import { renderInRouter } from "#/test/renderInRouter";

import { CockpitWindow } from "./CockpitWindow";

type RenderCockpitWindowParams = {
  isLocked: boolean;
  onClose: () => void;
  isGreeting?: boolean;
  onBoard?: () => void;
};

async function renderCockpitWindow({
  isLocked,
  onClose,
  isGreeting = false,
  onBoard = vi.fn(),
}: RenderCockpitWindowParams) {
  return renderInRouter({
    ui: (
      <MusicProvider>
        <CockpitWindow
          reveal="instant"
          isGreeting={isGreeting}
          onBoard={onBoard}
          isClosing={false}
          isLocked={isLocked}
          onClose={onClose}
          onClosed={vi.fn()}
          onGo={vi.fn()}
        />
      </MusicProvider>
    ),
  });
}

describe("CockpitWindow", () => {
  it("closes on Esc", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    await renderCockpitWindow({ isLocked: false, onClose });

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignores Esc once a launch is confirmed, and takes no more commands", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    await renderCockpitWindow({ isLocked: true, onClose });

    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "go on a spacewalk" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "command" })).toHaveAttribute("readonly");
  });

  it("shows the ship's name and its systems", async () => {
    await renderCockpitWindow({ isLocked: false, onClose: vi.fn() });

    expect(screen.getByRole("dialog", { name: "gh44 explorer" })).toBeInTheDocument();
    expect(screen.getByText("systems online")).toBeInTheDocument();
  });

  it("takes the command line's focus and holds the page behind as a modal dialog", async () => {
    await renderCockpitWindow({ isLocked: false, onClose: vi.fn() });

    expect(screen.getByRole("dialog", { name: "gh44 explorer" })).toHaveAttribute(
      "aria-modal",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "command" })).toHaveFocus();
  });

  it("greets without a modal or taking focus, and boards once the visitor steps in", async () => {
    const user = userEvent.setup();
    const onBoard = vi.fn();
    await renderCockpitWindow({ isLocked: false, onClose: vi.fn(), isGreeting: true, onBoard });

    const cockpit = screen.getByRole("dialog", { name: "gh44 explorer" });
    expect(cockpit).not.toHaveAttribute("aria-modal");
    expect(screen.getByRole("textbox", { name: "command" })).not.toHaveFocus();

    await user.click(screen.getByRole("textbox", { name: "command" }));

    expect(onBoard).toHaveBeenCalled();
  });
});
