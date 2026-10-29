import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("HomeStatement", () => {
  it("states the role", async () => {
    await renderAt("/");

    expect(screen.getByText("Senior Software Engineer.")).toBeInTheDocument();
  });

  it("links gh44-brain, gh44-theme and the work history to their pages", async () => {
    await renderAt("/");

    expect(screen.getByRole("link", { name: "gh44-brain" })).toHaveAttribute("href", "/gh44-brain");
    expect(screen.getByRole("link", { name: "gh44-theme" })).toHaveAttribute("href", "/gh44-theme");
    expect(screen.getByRole("link", { name: "work history" })).toHaveAttribute("href", "/work");
  });
});
