import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getRouter } from "#/router";

describe("PageTransition", () => {
  it("renders the current page inside main", async () => {
    const router = getRouter({ history: createMemoryHistory({ initialEntries: ["/"] }) });
    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("main")).toBeInTheDocument();
  });
});
