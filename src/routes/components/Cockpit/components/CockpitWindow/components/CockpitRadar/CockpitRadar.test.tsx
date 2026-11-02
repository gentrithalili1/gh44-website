import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { renderInRouter } from "#/test/renderInRouter";

import { CockpitRadar } from "./CockpitRadar";

function getRadar() {
  return within(screen.getByRole("region", { name: "radar" }));
}

describe("CockpitRadar", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("shows how many destinations this tab has visited", async () => {
    sessionStorage.setItem("gh44-explorer-visits", JSON.stringify(["work", "me"]));

    await renderInRouter({ ui: <CockpitRadar /> });

    expect(
      getRadar().getByRole("img", { name: "radar: 2 of 5 destinations visited" }),
    ).toBeVisible();
    expect(getRadar().getByText("2/5")).toBeInTheDocument();
  });

  it("reads out the route, and the nearest destination not visited yet", async () => {
    sessionStorage.setItem("gh44-explorer-visits", JSON.stringify(["me"]));

    await renderInRouter({ ui: <CockpitRadar /> });

    expect(getRadar().getByText("/")).toBeInTheDocument();
    expect(getRadar().getByText("gh44-confirm")).toBeInTheDocument();
  });

  it("says so once every destination is visited", async () => {
    sessionStorage.setItem(
      "gh44-explorer-visits",
      JSON.stringify(["me", "gh44-confirm", "work", "gh44-theme", "gh44-brain"]),
    );

    await renderInRouter({ ui: <CockpitRadar /> });

    expect(getRadar().getByText("all visited")).toBeInTheDocument();
  });
});
