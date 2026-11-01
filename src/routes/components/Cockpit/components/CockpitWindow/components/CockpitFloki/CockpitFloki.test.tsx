import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CockpitFloki } from "./CockpitFloki";

describe("CockpitFloki", () => {
  it("shows what floki is doing, with his signal in the grille", () => {
    const { container } = render(<CockpitFloki status="speaking" getLevel={() => 0} />);

    expect(screen.getByText("speaking", { exact: false })).toBeInTheDocument();
    expect(container.querySelector("[data-status=speaking] svg")).toBeInTheDocument();
  });

  it("stays out of the accessibility tree: the terminal speaks for him", () => {
    const { container } = render(<CockpitFloki status="idle" getLevel={() => 0} />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
