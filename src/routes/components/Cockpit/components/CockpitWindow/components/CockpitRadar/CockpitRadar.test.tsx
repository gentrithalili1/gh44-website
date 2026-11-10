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
    expect(getRadar().getByText("work")).toBeInTheDocument();
  });

  it("picks up a signal once every destination is visited", async () => {
    sessionStorage.setItem(
      "gh44-explorer-visits",
      JSON.stringify(["me", "gh44-confirm", "work", "gh44-theme", "gh44-brain"]),
    );

    await renderInRouter({ ui: <CockpitRadar /> });

    expect(getRadar().getByText("signal")).toBeInTheDocument();
    expect(getRadar().getByText("gargantua")).toBeInTheDocument();
    expect(getRadar().getByText("5/5")).toBeInTheDocument();
  });

  it("names the signal and counts it, once the visitor has been through", async () => {
    sessionStorage.setItem(
      "gh44-explorer-visits",
      JSON.stringify(["me", "gh44-confirm", "work", "gh44-theme", "gh44-brain"]),
    );
    sessionStorage.setItem("gh44-explorer-secrets", JSON.stringify(["horizon"]));

    await renderInRouter({ ui: <CockpitRadar /> });

    expect(getRadar().getByText("gargantua")).toBeInTheDocument();
    expect(getRadar().getByText("6/5")).toBeInTheDocument();
  });
});
