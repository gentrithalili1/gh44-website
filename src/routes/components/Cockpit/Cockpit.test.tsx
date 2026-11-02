import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubReducedMotion } from "#/test/motion";
import { renderAt } from "#/test/renderAt";

const COCKPIT = { name: "gh44 explorer" } as const;
const COMMAND = { name: "command" } as const;

type User = ReturnType<typeof userEvent.setup>;

async function openCockpit(user: User) {
  await user.keyboard("{Meta>}k{/Meta}");
  return screen.getByRole("dialog", COCKPIT);
}

async function runCommand({ user, command }: { user: User; command: string }) {
  await user.type(screen.getByRole("textbox", COMMAND), `${command}{Enter}`);
}

function getOutput() {
  return screen.getByRole("log", { name: "terminal output" });
}

describe("Cockpit", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens on Cmd+K with the command line focused", async () => {
    const user = userEvent.setup();
    await renderAt("/");

    const cockpit = await openCockpit(user);

    expect(cockpit).toHaveAttribute("aria-modal", "true");
    expect(within(cockpit).getByRole("textbox", COMMAND)).toHaveFocus();
  });

  it("opens on Ctrl+K too", async () => {
    const user = userEvent.setup();
    await renderAt("/");

    await user.keyboard("{Control>}k{/Control}");

    expect(screen.getByRole("dialog", COCKPIT)).toBeInTheDocument();
  });

  it("stays shut while the visitor types in another field", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    render(
      <label>
        note
        <input />
      </label>,
    );

    await user.click(screen.getByRole("textbox", { name: "note" }));
    await user.keyboard("{Meta>}k{/Meta}");

    expect(screen.queryByRole("dialog", COCKPIT)).not.toBeInTheDocument();
  });

  it("closes on Esc and stays on the planet", async () => {
    const user = userEvent.setup();
    await renderAt("/work");
    await openCockpit(user);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", COCKPIT)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "work" })).toBeInTheDocument();
  });

  it("closes on Esc after a click inside, and stays on the planet", async () => {
    const user = userEvent.setup();
    await renderAt("/work");
    await openCockpit(user);

    await user.click(getOutput());
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", COCKPIT)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "work" })).toBeInTheDocument();
  });

  it("gives focus back to where it was on close", async () => {
    const user = userEvent.setup();
    await renderAt("/work");
    const backLink = screen.getByRole("link", { name: "back to orbit" });
    backLink.focus();
    await openCockpit(user);

    await user.keyboard("{Escape}");

    expect(backLink).toHaveFocus();
  });

  it("keeps Tab inside the cockpit", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    const cockpit = await openCockpit(user);

    const input = within(cockpit).getByRole("textbox", COMMAND);
    const close = within(cockpit).getByRole("button", { name: "go on a spacewalk" });

    // The command line is last: Tab wraps to the close button, Shift+Tab back.
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(input).toHaveFocus();
  });

  it("leaves on a spacewalk from its button", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    const cockpit = await openCockpit(user);

    await user.click(within(cockpit).getByRole("button", { name: "go on a spacewalk" }));

    expect(screen.queryByRole("dialog", COCKPIT)).not.toBeInTheDocument();
  });

  it("flies to work on `go work`, in any case and spacing", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    await openCockpit(user);

    await runCommand({ user, command: "  GO   Work " });

    expect(await screen.findByRole("heading", { level: 1, name: "work" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", COCKPIT)).not.toBeInTheDocument();
  });

  it("still flies to work with reduced motion, at once", async () => {
    stubReducedMotion(true);
    const user = userEvent.setup();
    await renderAt("/");
    await openCockpit(user);

    await runCommand({ user, command: "go work" });

    expect(await screen.findByRole("heading", { level: 1, name: "work" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", COCKPIT)).not.toBeInTheDocument();
  });

  it("welcomes the visitor with every destination to click", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    await openCockpit(user);

    const output = within(getOutput());
    expect(output.getByText("welcome aboard. type help.")).toBeInTheDocument();
    expect(output.getAllByRole("link").map((link) => link.textContent)).toEqual([
      "me",
      "gh44-confirm",
      "work",
      "gh44-theme",
      "gh44-brain",
    ]);
  });

  it("flies to work from its name in the output", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    await openCockpit(user);
    await runCommand({ user, command: "clear" });
    await runCommand({ user, command: "destinations" });

    await user.click(within(getOutput()).getByRole("link", { name: "work" }));

    expect(await screen.findByRole("heading", { level: 1, name: "work" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", COCKPIT)).not.toBeInTheDocument();
  });

  it("lists the destinations for a planet name, and points unknown commands to help", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    await openCockpit(user);

    await runCommand({ user, command: "go earth" });
    await runCommand({ user, command: "warp" });

    expect(getOutput()).toHaveTextContent("unknown destination: earth");
    expect(getOutput()).toHaveTextContent(
      "destinations: me, gh44-confirm, work, gh44-theme, gh44-brain",
    );
    expect(getOutput()).toHaveTextContent("command not found: warp");
    expect(getOutput()).toHaveTextContent("type help for commands.");
    expect(screen.getByRole("dialog", COCKPIT)).toBeInTheDocument();
  });

  it("echoes each command at the prompt, and clears the screen", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    await openCockpit(user);

    await runCommand({ user, command: "whoami" });
    expect(getOutput()).toHaveTextContent("nav> whoami");
    const output = within(getOutput());
    for (const line of ["gentrit halili", "senior frontend engineer", "pristina, kosovo"]) {
      expect(output.getByText(line)).toBeInTheDocument();
    }

    await runCommand({ user, command: "clear" });
    expect(getOutput()).toBeEmptyDOMElement();
  });

  it("steps through earlier commands with the arrow keys", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    await openCockpit(user);
    await runCommand({ user, command: "whoami" });
    await runCommand({ user, command: "status" });
    const input = screen.getByRole("textbox", COMMAND);

    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("status");
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("whoami");
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("whoami");
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveValue("status");
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveValue("");
  });

  it("shows the real progress on explore", async () => {
    const user = userEvent.setup();
    await renderAt("/work");
    await user.click(screen.getByRole("link", { name: "me" }));
    await screen.findByRole("heading", { level: 1, name: "gentrit halili" });
    await openCockpit(user);

    await runCommand({ user, command: "explore" });

    expect(getOutput()).toHaveTextContent("progress: 2/5");
  });
});
