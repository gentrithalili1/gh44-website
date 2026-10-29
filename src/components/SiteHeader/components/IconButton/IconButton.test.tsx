import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("is a button named by its label", () => {
    render(<IconButton icon={MenuIcon} label="Open menu" />);

    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<IconButton icon={MenuIcon} label="Open menu" onClick={handleClick} />);

    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
