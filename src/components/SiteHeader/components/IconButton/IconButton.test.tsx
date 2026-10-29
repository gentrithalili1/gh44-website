import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("is a button named by its label", () => {
    render(
      <IconButton label="Open menu">
        <MenuIcon aria-hidden />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(
      <IconButton label="Open menu" onClick={handleClick}>
        <MenuIcon aria-hidden />
      </IconButton>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
