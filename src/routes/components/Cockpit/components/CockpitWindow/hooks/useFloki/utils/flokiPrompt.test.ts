import { describe, expect, it } from "vitest";

import { PLANETS } from "#/utils/planets";

import { getFlokiPrompt } from "./flokiPrompt";

describe("getFlokiPrompt", () => {
  it("knows every planet, the current role and the terminal commands", () => {
    const prompt = getFlokiPrompt({ humor: 60 });

    for (const planet of PLANETS) expect(prompt).toContain(`- ${planet.id} (`);
    expect(prompt).toContain("Senior Frontend Engineer at JOIN, 2026-02 to now");
    expect(prompt).toContain("- go <destination>: fly to a destination");
  });

  it("knows who he is and who his captain is, without made-up memories", () => {
    const prompt = getFlokiPrompt({ humor: 60 });

    expect(prompt).toContain("late black German Shepherd");
    expect(prompt).toContain("You have none of his memories");
    expect(prompt).toContain("nickname Granko");
  });

  it("carries the humor setting", () => {
    expect(getFlokiPrompt({ humor: 25 })).toContain("Humor setting: 25%.");
  });
});
