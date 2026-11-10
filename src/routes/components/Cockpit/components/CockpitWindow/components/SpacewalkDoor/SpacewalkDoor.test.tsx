import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SpacewalkDoor } from "./SpacewalkDoor";

describe("SpacewalkDoor", () => {
  it("goes on a spacewalk from the hatch, named under it", async () => {
    const user = userEvent.setup();
    const onSpacewalk = vi.fn();
    render(<SpacewalkDoor variant="hatch" isLocked={false} onSpacewalk={onSpacewalk} />);

    expect(screen.getByText("spacewalk")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "go on a spacewalk" }));

    expect(onSpacewalk).toHaveBeenCalledOnce();
  });

  it("stays shut after a launch", () => {
    render(<SpacewalkDoor variant="compact" isLocked onSpacewalk={vi.fn()} />);

    expect(screen.getByRole("button", { name: "go on a spacewalk" })).toBeDisabled();
  });
});
