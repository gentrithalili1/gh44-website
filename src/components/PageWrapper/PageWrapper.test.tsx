import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageWrapper } from "./PageWrapper";

describe("PageWrapper", () => {
  it("renders its content", () => {
    render(
      <PageWrapper>
        <h1>Work experience</h1>
      </PageWrapper>,
    );

    expect(screen.getByRole("heading", { name: "Work experience" })).toBeInTheDocument();
  });

  it("centers its content with the centered variant", () => {
    render(
      <PageWrapper variant="centered">
        <h1>Hi</h1>
      </PageWrapper>,
    );

    expect(screen.getByRole("heading", { name: "Hi" }).parentElement).toHaveClass("items-center");
  });
});
