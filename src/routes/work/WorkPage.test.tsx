import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("WorkPage", () => {
  it("renders the page heading", async () => {
    await renderAt("/work");

    expect(screen.getByRole("heading", { level: 1, name: "Work experience" })).toBeInTheDocument();
  });
});
