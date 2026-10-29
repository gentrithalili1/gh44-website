import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteLogoRandomAccent } from "./SiteLogoRandomAccent";

describe("SiteLogoRandomAccent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts lavender", () => {
    render(<SiteLogoRandomAccent>44</SiteLogoRandomAccent>);

    expect(screen.getByText("44")).toHaveClass("text-primary");
  });

  it("switches to a random other palette color after each loop", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    render(<SiteLogoRandomAccent>44</SiteLogoRandomAccent>);

    fireEvent.animationIteration(screen.getByText("44"));

    expect(screen.getByText("44")).toHaveClass("text-seafoam");
    expect(screen.getByText("44")).not.toHaveClass("text-primary");
  });
});
