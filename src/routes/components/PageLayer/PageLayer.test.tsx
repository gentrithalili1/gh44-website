import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

const BACK_LINK = { name: "back to orbit" } as const;

describe("PageLayer", () => {
  it("steps the page out of the way while the cockpit is open, and brings it back after", async () => {
    const user = userEvent.setup();
    await renderAt("/work");

    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.queryByRole("link", BACK_LINK)).not.toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("link", BACK_LINK)).toBeInTheDocument();
  });
});
