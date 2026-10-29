import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("HomeStatement", () => {
  it("states the current position", async () => {
    await renderAt("/");

    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
  });

  it("says where to write", async () => {
    await renderAt("/");

    // The phrase and the address sit in different elements; match the paragraph that ends with both.
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === "P" &&
          element.textContent?.endsWith("Write to me at gentrithalili11@gmail.com") === true,
      ),
    ).toBeInTheDocument();
  });
});
