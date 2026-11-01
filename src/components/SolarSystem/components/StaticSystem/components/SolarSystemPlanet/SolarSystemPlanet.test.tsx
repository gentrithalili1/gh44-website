import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

const COMPANY_MOONS = [
  "JOIN · Senior Frontend Engineer",
  "Belt Software · Senior Frontend Engineer",
  "Povio · Senior Frontend Engineer",
  "Beetroot Academy Kosovo · Advanced JavaScript Trainer",
  "Kutia Digital Agency · Frontend Developer & Team Lead",
  "ATIS Digital Agency · JavaScript Developer",
  "UBT · JavaScript Developer",
  "Rrota · Web Developer Intern",
];

const APP_RINGS = [
  "gh44 for zed",
  "gh44 for warp",
  "gh44 for slack",
  "gh44 for linear",
  "gh44 for chrome",
  "gh44 for github",
  "gh44 for shadcn/ui",
];

const AGENT_SATELLITES = ["implementer", "researcher", "verifier", "reviewer"];

describe("SolarSystemPlanet", () => {
  it.each([
    { planet: "earth", names: ["the moon"] },
    { planet: "mars", names: ["resolve", "reject"] },
    { planet: "jupiter", names: COMPANY_MOONS },
    { planet: "saturn", names: APP_RINGS },
    { planet: "neptune", names: AGENT_SATELLITES },
  ])("names what orbits $planet on hover", async ({ names }) => {
    await renderAt("/");

    for (const name of names) expect(screen.getByText(name)).toBeInTheDocument();
  });
});
