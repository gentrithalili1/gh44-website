import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("ConfirmPanel", () => {
  it("shows how to use gh44-confirm as steps in order, each with its code", async () => {
    await renderAt("/gh44-confirm");

    const steps = within(screen.getByRole("list", { name: "use gh44-confirm" })).getAllByRole(
      "listitem",
    );
    expect(steps.map((step) => step.querySelector("dfn")?.textContent)).toEqual([
      "install",
      "wrap",
      "await",
    ]);
    expect(steps[0]).toHaveTextContent("npm i react-promise-confirmation-dialog");
    expect(steps[1]).toHaveTextContent("<PromiseConfirmationContextProvider>");
    expect(steps[2]).toHaveTextContent("await confirmation.confirm()");
  });
});
