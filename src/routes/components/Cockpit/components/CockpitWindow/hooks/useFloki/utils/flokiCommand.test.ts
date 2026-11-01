import { describe, expect, it } from "vitest";

import { getFlokiCommand } from "./flokiCommand";

function getDestinationName(text: string) {
  const command = getFlokiCommand(text);
  return command?.kind === "go" ? command.destination.name : undefined;
}

describe("getFlokiCommand", () => {
  it.each([
    ["Take me to your work.", "work"],
    ["go back to Earth", "me"],
    ["fly to gh44 brain", "gh44-brain"],
    ["show me the color theme", "gh44-theme"],
    ["please take me to mars", "gh44-confirm"],
    ["navigate to the gh44-confirm planet", "gh44-confirm"],
  ])("flies for %j", (text, name) => {
    expect(getDestinationName(text)).toBe(name);
  });

  it.each(["what is gh44-brain", "take me somewhere fun", "show me saturn and jupiter", "go"])(
    "leaves %j to the model",
    (text) => {
      expect(getFlokiCommand(text)).toBeUndefined();
    },
  );

  it.each([
    ["set humor to 40%", 40],
    ["Humour setting 75 percent", 75],
    ["floki set your humor to 250", 100],
  ])("sets the humor for %j", (text, humor) => {
    expect(getFlokiCommand(text)).toEqual({ kind: "humor", humor });
  });
});
