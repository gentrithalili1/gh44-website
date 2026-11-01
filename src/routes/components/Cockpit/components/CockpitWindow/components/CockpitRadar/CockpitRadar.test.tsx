import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { CockpitRadar } from "./CockpitRadar";

describe("CockpitRadar", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("shows how many destinations this tab has visited", () => {
    sessionStorage.setItem("gh44-explorer-visits", JSON.stringify(["work", "me"]));

    render(<CockpitRadar />);

    expect(screen.getByRole("img", { name: "radar: 2 of 5 destinations visited" })).toBeVisible();
  });
});
