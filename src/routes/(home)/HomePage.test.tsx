import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("HomePage", () => {
  it("renders the page heading", async () => {
    await renderAt("/");

    expect(screen.getByRole("heading", { level: 1, name: "gh44.dev" })).toBeInTheDocument();
  });
});
