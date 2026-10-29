import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("NotFound", () => {
  it("says the page does not exist", async () => {
    await renderAt("/does-not-exist");

    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
    expect(screen.getByText("This page does not exist.")).toBeInTheDocument();
  });
});
