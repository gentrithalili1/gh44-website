import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

const SHIP = { name: "gh44 explorer" } as const;

describe("StaticShip", () => {
  it("opens the cockpit from the ship, and is no longer expanded once it closes", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    const ship = screen.getByRole("button", SHIP);

    await user.click(ship);
    expect(screen.getByRole("dialog", { name: "gh44 explorer" })).toBeInTheDocument();
    expect(ship).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "gh44 explorer" })).not.toBeInTheDocument();
    expect(ship).toHaveAttribute("aria-expanded", "false");
  });

  it("steps the ship back while a planet is open", async () => {
    await renderAt("/work");

    expect(screen.getByRole("button", SHIP)).toBeDisabled();
  });
});
