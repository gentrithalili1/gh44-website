import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

const ROLE_MOONS = [
  "JOIN · Senior Frontend Engineer",
  "Belt Software · Senior Frontend Engineer",
  "Povio · Senior Frontend Engineer",
  "Beetroot Academy Kosovo · Advanced JavaScript Trainer",
  "Kutia Digital Agency · Frontend Developer & Team Lead",
  "ATIS Digital Agency · JavaScript Developer",
  "UBT · JavaScript Developer",
  "Rrota · Web Developer Intern",
];

const APP_MOONS = [
  "gh44 for zed",
  "gh44 for warp",
  "gh44 for slack",
  "gh44 for linear",
  "gh44 for chrome",
  "gh44 for github",
  "gh44 for shadcn/ui",
];

describe("SolarSystemPlanet", () => {
  it.each([
    { planet: "work", moons: ROLE_MOONS },
    { planet: "gh44-theme", moons: APP_MOONS },
  ])("gives $planet its moons, named on hover", async ({ moons }) => {
    await renderAt("/");

    for (const moon of moons) expect(screen.getByText(moon)).toBeInTheDocument();
  });
});
