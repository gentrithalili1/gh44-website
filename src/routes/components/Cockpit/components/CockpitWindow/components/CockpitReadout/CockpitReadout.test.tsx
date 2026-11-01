import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { renderInRouter } from "#/test/renderInRouter";

import { CockpitReadout } from "./CockpitReadout";

function getReadout() {
  return within(screen.getByRole("region", { name: "flight readout" }));
}

describe("CockpitReadout", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("reads out the route, and the nearest destination not visited yet", async () => {
    sessionStorage.setItem("gh44-explorer-visits", JSON.stringify(["me"]));

    await renderInRouter({ ui: <CockpitReadout /> });

    expect(getReadout().getByText("/")).toBeInTheDocument();
    expect(getReadout().getByText("gh44-confirm")).toBeInTheDocument();
  });

  it("says so once every destination is visited", async () => {
    sessionStorage.setItem(
      "gh44-explorer-visits",
      JSON.stringify(["me", "gh44-confirm", "work", "gh44-theme", "gh44-brain"]),
    );

    await renderInRouter({ ui: <CockpitReadout /> });

    expect(getReadout().getByText("all visited")).toBeInTheDocument();
  });
});
