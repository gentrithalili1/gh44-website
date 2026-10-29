import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("Gh44BrainPage", () => {
  it("renders the page heading", async () => {
    await renderAt("/gh44-brain");

    expect(screen.getByRole("heading", { level: 1, name: "gh44-brain" })).toBeInTheDocument();
  });
});
