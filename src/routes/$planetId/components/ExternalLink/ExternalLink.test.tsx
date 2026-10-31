import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExternalLink } from "./ExternalLink";

describe("ExternalLink", () => {
  it("opens in a new tab and says so", () => {
    render(<ExternalLink href="https://example.com">example</ExternalLink>);

    const link = screen.getByRole("link", { name: "example (opens in new tab)" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
