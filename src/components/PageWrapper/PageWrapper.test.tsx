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
});
