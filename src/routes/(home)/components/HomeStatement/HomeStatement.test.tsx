import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("HomeStatement", () => {
  it("states the current position", async () => {
    await renderAt("/");

    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
  });
});
