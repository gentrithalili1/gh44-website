import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { ExplorerProvider, useExplorer } from "#/hooks/useExplorer";
import { renderAt } from "#/test/renderAt";

import { PageLayer } from "./PageLayer";

const BACK_LINK = { name: "back to orbit" } as const;

describe("PageLayer", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("steps the page out of the way while the cockpit is open, and brings it back after", async () => {
    const user = userEvent.setup();
    await renderAt("/work");

    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.queryByRole("link", BACK_LINK)).not.toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("link", BACK_LINK)).toBeInTheDocument();
  });

  it("leaves the page readable behind a cockpit that only greets the visitor", async () => {
    const user = userEvent.setup();
    render(
      <ExplorerProvider>
        <PageLayer>
          <h1>home</h1>
        </PageLayer>
        <GreetButton />
      </ExplorerProvider>,
    );

    await user.click(screen.getByRole("button", { name: "greet" }));

    expect(screen.getByRole("heading", { level: 1, name: "home" })).toBeVisible();
  });
});

// Stands in for the scene, which greets a first visit with the cockpit.
function GreetButton() {
  const explorer = useExplorer();

  return (
    <button type="button" onClick={explorer.greetVisitor}>
      greet
    </button>
  );
}
