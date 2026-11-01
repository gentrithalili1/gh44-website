import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("LaunchDialog", () => {
  it("starts on abort, the safe choice", async () => {
    const user = userEvent.setup();
    await renderAt("/confirm");

    await user.click(screen.getByRole("button", { name: "launch rocket?" }));

    expect(screen.getByRole("button", { name: "abort" })).toHaveFocus();
  });

  it("aborts on Esc and stays on the planet", async () => {
    const user = userEvent.setup();
    await renderAt("/confirm");

    await user.click(screen.getByRole("button", { name: "launch rocket?" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    // Announced to screen readers.
    expect(screen.getByText("aborted. the rocket is relieved.")).toHaveAttribute("role", "status");
    expect(screen.getByRole("heading", { level: 1, name: "confirm()" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "launch rocket?" })).toHaveFocus();
  });

  it("keeps Tab inside the dialog", async () => {
    const user = userEvent.setup();
    await renderAt("/confirm");

    await user.click(screen.getByRole("button", { name: "launch rocket?" }));
    await user.tab();
    await user.tab();

    expect(screen.getByRole("button", { name: "abort" })).toHaveFocus();
  });
});
