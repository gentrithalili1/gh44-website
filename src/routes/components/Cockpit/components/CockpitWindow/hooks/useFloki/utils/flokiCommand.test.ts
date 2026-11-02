import { describe, expect, it } from "vitest";

import { TRACKS } from "#/routes/hooks/useMusic/utils/tracks";

import { getFlokiCommand } from "./flokiCommand";

function getCommand(text: string) {
  return getFlokiCommand({ text, tracks: TRACKS });
}

function getDestinationName(text: string) {
  const command = getCommand(text);
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
      expect(getCommand(text)).toBeUndefined();
    },
  );

  it.each([
    ["set humor to 40%", 40],
    ["Humour setting 75 percent", 75],
    ["floki set your humor to 250", 100],
  ])("sets the humor for %j", (text, humor) => {
    expect(getCommand(text)).toEqual({ kind: "humor", humor });
  });

  it.each([
    ["play", "play"],
    ["Floki, play some music please", "play"],
    ["turn on the radio", "play"],
    ["stop the music", "stop"],
    ["pause", "stop"],
    ["turn off the radio", "stop"],
    ["next song", "next"],
    ["skip this track", "next"],
    ["play next", "next"],
    ["play the next song please", "next"],
    ["skip song", "next"],
    ["play the previous one", "previous"],
    ["previous track", "previous"],
    ["go back a song", "previous"],
  ])("works the radio for %j", (text, action) => {
    expect(getCommand(text)).toEqual({ kind: "music", action });
  });

  it.each([
    ["play stay", 1],
    ["Play S.T.A.Y.", 1],
    ["put on the starship avalon", 3],
    ["play crystalline by thomas newman", 0],
  ])("picks the track for %j", (text, trackIndex) => {
    expect(getCommand(text)).toEqual({ kind: "track", trackIndex });
  });

  it.each(["play something by thomas newman", "play something chill", "stop", "what song is this"])(
    "leaves %j to the model",
    (text) => {
      expect(getCommand(text)).toBeUndefined();
    },
  );
});
