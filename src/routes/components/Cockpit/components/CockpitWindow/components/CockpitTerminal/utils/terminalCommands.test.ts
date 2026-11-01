import { describe, expect, it } from "vitest";

import { getWelcomeLines, runCommand } from "./terminalCommands";

const AT_HOME = { pathname: "/", visitedIds: [] } as const;

const DESTINATION_LIST = "destinations: me, gh44-confirm, work, gh44-theme, gh44-brain";

describe("getWelcomeLines", () => {
  it("welcomes the visitor aboard, with the destinations to pick from", () => {
    expect(getWelcomeLines()).toEqual(["welcome aboard. type help.", DESTINATION_LIST]);
  });
});

describe("runCommand", () => {
  it("lists every command on help, and the destinations", () => {
    expect(runCommand({ input: "help", context: AT_HOME })).toEqual({
      kind: "print",
      lines: [
        "commands:",
        "  help              list commands",
        "  clear             clear the screen",
        "  whoami            who built this ship",
        "  status            ship and system status",
        "  destinations      where you can go",
        "  coordinates       where you are",
        "  explore           what you have visited",
        "  go <destination>  fly to a destination",
        "  floki <question>  ask the onboard computer",
        DESTINATION_LIST,
      ],
    });
  });

  it("clears the screen", () => {
    expect(runCommand({ input: "clear", context: AT_HOME })).toEqual({ kind: "clear" });
  });

  it("says who gentrit is, with real facts only", () => {
    expect(runCommand({ input: "whoami", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["gentrit halili", "senior frontend engineer", "pristina, kosovo"],
    });
  });

  it("reports the ship and the system", () => {
    expect(runCommand({ input: "status", context: AT_HOME })).toEqual({
      kind: "print",
      lines: [
        "ship: gh44 explorer",
        "engines: warm",
        "shields: dark mode",
        "system: 8 planets, 5 open to visitors",
        "crew: 1, plus you",
      ],
    });
  });

  it("lists the destinations with what each holds", () => {
    expect(runCommand({ input: "destinations", context: AT_HOME })).toEqual({
      kind: "print",
      lines: [
        "  me                who, where, how to reach",
        "  gh44-confirm      promise based react dialogs",
        "  work              8 moons · 2016 → now",
        "  gh44-theme        one theme, 7 tools",
        "  gh44-brain        claude code, my way",
      ],
    });
  });

  it("gives the current route as coordinates", () => {
    expect(
      runCommand({ input: "coordinates", context: { pathname: "/work", visitedIds: [] } }),
    ).toEqual({ kind: "print", lines: ["route: /work"] });
  });

  it("shows which destinations are visited, and the progress", () => {
    expect(
      runCommand({ input: "explore", context: { pathname: "/", visitedIds: ["work", "me"] } }),
    ).toEqual({
      kind: "print",
      lines: [
        "  me                visited",
        "  gh44-confirm      unknown",
        "  work              visited",
        "  gh44-theme        unknown",
        "  gh44-brain        unknown",
        "progress: 2/5",
      ],
    });
  });

  it("flies to a destination in any case and with extra whitespace", () => {
    expect(runCommand({ input: "  GO   Work ", context: AT_HOME })).toEqual({
      kind: "go",
      destination: { name: "work", route: "/work", description: "8 moons · 2016 → now" },
      lines: [
        "destination: work",
        "route: /work",
        "navigation locked.",
        "initiating transition...",
      ],
    });
  });

  it("lists the valid destinations for a planet name", () => {
    expect(runCommand({ input: "go earth", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["unknown destination: earth", DESTINATION_LIST],
    });
  });

  it("asks where to go without a destination", () => {
    expect(runCommand({ input: "go", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["usage: go <destination>", DESTINATION_LIST],
    });
  });

  it("points an unknown command to help", () => {
    expect(runCommand({ input: "warp 9", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["command not found: warp", "type help for commands."],
    });
  });

  it("prints nothing for an empty line", () => {
    expect(runCommand({ input: "   ", context: AT_HOME })).toEqual({ kind: "print", lines: [] });
  });

  it("asks floki the rest of the line", () => {
    expect(runCommand({ input: "floki What is   gh44-brain?", context: AT_HOME })).toEqual({
      kind: "ask",
      question: "what is gh44-brain?",
      lines: [],
    });
  });

  it("shows floki's usage without a question", () => {
    expect(runCommand({ input: "floki", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["usage: floki <question>"],
    });
  });
});
