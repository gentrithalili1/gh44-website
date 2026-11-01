import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

describe("BackToOrbitLink", () => {
  it("takes a planet page back home", async () => {
    const user = userEvent.setup();
    await renderAt("/work");

    await user.click(screen.getByRole("link", { name: "back to orbit" }));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "gentrit halili, senior frontend engineer",
      }),
    ).toBeInTheDocument();
  });

  it("leads back into the cockpit after a launch from it", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    await user.keyboard("{Meta>}k{/Meta}");
    await user.type(screen.getByRole("textbox", { name: "command" }), "go work{Enter}");

    await user.click(await screen.findByRole("link", { name: "back to cockpit" }));

    expect(await screen.findByRole("dialog", { name: "gh44 explorer" })).toBeInTheDocument();
  });

  it("leads back to orbit on a planet reached from the orbit", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    await user.keyboard("{Meta>}k{/Meta}");
    await user.type(screen.getByRole("textbox", { name: "command" }), "go work{Enter}");
    await user.click(await screen.findByRole("link", { name: "back to cockpit" }));
    await user.keyboard("{Escape}");

    await user.click(await screen.findByRole("link", { name: "me" }));

    expect(await screen.findByRole("link", { name: "back to orbit" })).toBeInTheDocument();
  });
});
