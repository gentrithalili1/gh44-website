import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("LaunchDemo", () => {
  it("asks with the package's dialog before launching", async () => {
    const user = userEvent.setup();
    await renderAt("/gh44-confirm");

    await user.click(screen.getByRole("button", { name: "launch rocket?" }));

    expect(screen.getByRole("alertdialog", { name: "launch rocket?" })).toBeInTheDocument();
  });

  it("launches the rocket on confirm, and says so", async () => {
    const user = userEvent.setup();
    await renderAt("/gh44-confirm");

    await user.click(screen.getByRole("button", { name: "launch rocket?" }));
    await user.click(screen.getByRole("button", { name: "launch" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    // Announced to screen readers.
    expect(screen.getByText("launched. it's not coming back.")).toHaveAttribute("role", "status");
  });

  it("aborts on cancel, and says so", async () => {
    const user = userEvent.setup();
    await renderAt("/gh44-confirm");

    await user.click(screen.getByRole("button", { name: "launch rocket?" }));
    await user.click(screen.getByRole("button", { name: "abort" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    // Announced to screen readers.
    expect(screen.getByText("aborted. the rocket is relieved.")).toHaveAttribute("role", "status");
  });

  it("stands a rocket on Mars only once asked, and lifts it off the planet on launch", async () => {
    const user = userEvent.setup();
    await renderAt("/gh44-confirm");
    // The static system's rocket: drawn on Mars, not in the panel.
    const getRocket = () => document.querySelector("svg path[data-status]");

    expect(getRocket()).toBeNull();
    await user.click(screen.getByRole("button", { name: "launch rocket?" }));
    expect(getRocket()).toHaveAttribute("data-status", "asking");

    await user.click(screen.getByRole("button", { name: "launch" }));
    expect(getRocket()).toHaveAttribute("data-status", "launched");
  });

  it("takes the rocket off Mars on abort", async () => {
    const user = userEvent.setup();
    await renderAt("/gh44-confirm");

    await user.click(screen.getByRole("button", { name: "launch rocket?" }));
    await user.click(screen.getByRole("button", { name: "abort" }));

    expect(document.querySelector("svg path[data-status]")).toBeNull();
  });
});
