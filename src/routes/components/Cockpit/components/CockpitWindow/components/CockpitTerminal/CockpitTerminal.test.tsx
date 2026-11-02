import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderInRouter } from "#/test/renderInRouter";

import { useTerminal } from "../../hooks/useTerminal";
import { CockpitTerminal } from "./CockpitTerminal";

// The terminal with its screen, as the cockpit gives it one.
function TerminalWithScreen(
  props: Omit<ComponentProps<typeof CockpitTerminal>, "terminal" | "onAsk"> & {
    onAsk?: (question: string) => void;
  },
) {
  const terminal = useTerminal();
  return <CockpitTerminal {...props} terminal={terminal} onAsk={props.onAsk ?? vi.fn()} />;
}

function getOutput() {
  return within(screen.getByRole("log", { name: "terminal output" }));
}

describe("CockpitTerminal", () => {
  it("greets the visitor as floki", async () => {
    await renderInRouter({
      ui: <TerminalWithScreen isLocked={false} shouldFocus onGo={vi.fn()} />,
    });

    expect(getOutput().getByText(/floki online/)).toBeInTheDocument();
  });

  it("hands floki <question> to floki", async () => {
    const user = userEvent.setup();
    const onAsk = vi.fn();
    await renderInRouter({
      ui: <TerminalWithScreen isLocked={false} shouldFocus onAsk={onAsk} onGo={vi.fn()} />,
    });

    await user.type(
      screen.getByRole("textbox", { name: "command" }),
      "floki who is gentrit{Enter}",
    );

    expect(onAsk).toHaveBeenCalledWith("who is gentrit");
  });

  it("runs go for a destination clicked in the output", async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    await renderInRouter({ ui: <TerminalWithScreen isLocked={false} shouldFocus onGo={onGo} /> });

    await user.click(getOutput().getByRole("link", { name: "gh44-theme" }));

    expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/gh44-theme" }));
    expect(screen.getByRole("log", { name: "terminal output" })).toHaveTextContent(
      "nav> go gh44-theme",
    );
  });

  it("takes no clicks on destinations once a launch is locked in", async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    await renderInRouter({ ui: <TerminalWithScreen isLocked shouldFocus onGo={onGo} /> });

    const link = getOutput().getByRole("link", { name: "work" });
    await user.click(link);

    expect(onGo).not.toHaveBeenCalled();
    expect(link).toHaveAttribute("aria-disabled", "true");
  });

  it("is the nav console", async () => {
    await renderInRouter({
      ui: <TerminalWithScreen isLocked={false} shouldFocus onGo={vi.fn()} />,
    });

    expect(screen.getByRole("region", { name: "nav console" })).toBeInTheDocument();
  });
});
