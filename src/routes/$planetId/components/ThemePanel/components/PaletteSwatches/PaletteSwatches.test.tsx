import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("PaletteSwatches", () => {
  it("shows the 9 palette hues, soft or vivid", async () => {
    const user = userEvent.setup();
    await renderAt("/gh44-theme");

    const palette = screen.getByRole("list", { name: "palette" });
    expect(within(palette).getAllByRole("listitem")).toHaveLength(9);
    expect(within(palette).getByText("terracotta #e49b80")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "vivid" }));

    expect(screen.getByRole("button", { name: "vivid" })).toHaveAttribute("aria-pressed", "true");
    expect(within(palette).getByText("terracotta #fe8b60")).toBeInTheDocument();
  });
});
