import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StepList } from "./StepList";

describe("StepList", () => {
  it("lists the steps in order, with a code block only where a step has code", () => {
    render(
      <StepList
        label="install"
        steps={[
          {
            id: "clone",
            name: "clone",
            text: "clone it.",
            code: [{ id: "git", label: "terminal", code: "git clone x", lines: undefined }],
          },
          { id: "run", name: "run", text: "run it." },
        ]}
      />,
    );

    const [clone, run] = within(screen.getByRole("list", { name: "install" })).getAllByRole(
      "listitem",
    );
    if (!clone || !run) throw new Error("Expected two steps");
    expect(clone).toHaveTextContent("clone");
    expect(within(clone).getByRole("tabpanel", { name: "terminal" })).toHaveTextContent(
      "git clone x",
    );
    expect(run).toHaveTextContent("run it.");
    expect(within(run).queryByRole("tabpanel")).not.toBeInTheDocument();
  });
});
