import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("PageHeader", () => {
  it.each([
    { path: "/work", title: "Work experience" },
    { path: "/gh44-brain", title: "gh44-brain" },
    { path: "/gh44-theme", title: "gh44-theme" },
  ])("renders the $path page title and lead", async ({ path, title }) => {
    await renderAt(path);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText("Coming soon.")).toBeInTheDocument();
  });
});
