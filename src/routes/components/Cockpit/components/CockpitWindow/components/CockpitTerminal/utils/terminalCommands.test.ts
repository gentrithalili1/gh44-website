import { describe, expect, it } from "vitest";

import { getWelcomeLines, runCommand } from "./terminalCommands";

const AT_HOME = {
  pathname: "/",
  visitedIds: [],
  hasBall: false,
  hasCrossedHorizon: false,
} as const;

const ALL_VISITED = {
  ...AT_HOME,
  visitedIds: ["me", "gh44-confirm", "work", "gh44-theme", "gh44-brain"],
} as const;

const DESTINATION_LIST = "destinations: me, work, gh44-confirm, gh44-theme, gh44-brain";

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
        "  work              8 moons · 2016 → now",
        "  gh44-confirm      promise based react dialogs",
        "  gh44-theme        one theme, 7 tools",
        "  gh44-brain        claude code, my way",
      ],
    });
  });

  it("gives the current route as coordinates", () => {
    expect(
      runCommand({ input: "coordinates", context: { ...AT_HOME, pathname: "/work" } }),
    ).toEqual({ kind: "print", lines: ["route: /work"] });
  });

  it("shows which destinations are visited, and the progress", () => {
    expect(
      runCommand({ input: "explore", context: { ...AT_HOME, visitedIds: ["work", "me"] } }),
    ).toEqual({
      kind: "print",
      lines: [
        "  me                visited",
        "  work              visited",
        "  gh44-confirm      unknown",
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

  it("answers the commands help never lists", () => {
    expect(runCommand({ input: "sudo make me a sandwich", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["nice try.", "this incident will be reported to floki."],
    });
    expect(runCommand({ input: "rm -rf /", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["deleting the solar system...", "permission denied. the sun is load-bearing."],
    });
    expect(runCommand({ input: "rm", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["rm what? be brave."],
    });
    expect(runCommand({ input: "git blame", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["gentrit. always gentrit."],
    });
    expect(runCommand({ input: "git status", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["working tree clean. space is tidy."],
    });
    expect(runCommand({ input: "42", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["the answer. the question is still loading."],
    });
  });

  it("lets floki answer praise, and asks for the rest of it", () => {
    expect(runCommand({ input: "good boy", context: AT_HOME })).toEqual({
      kind: "egg",
      egg: "praise",
      lines: ["ears up. tail would wag, if they'd built one."],
    });
    expect(runCommand({ input: "good", context: AT_HOME })).toEqual({
      kind: "print",
      lines: ["good what? finish the sentence."],
    });
  });

  it("throws floki's ball once, and leaves it out there after", () => {
    expect(runCommand({ input: "fetch", context: AT_HOME })).toEqual({
      kind: "egg",
      egg: "fetch",
      lines: ["ball's away. tracking it on the radar."],
    });
    expect(runCommand({ input: "fetch", context: { ...AT_HOME, hasBall: true } })).toEqual({
      kind: "egg",
      egg: "fetch",
      lines: ["it's still out there. your turn."],
    });
  });

  it("flies to gargantua for whoever knows the name, without listing it", () => {
    expect(DESTINATION_LIST).not.toContain("gargantua");
    expect(runCommand({ input: "go gargantua", context: AT_HOME })).toEqual({
      kind: "jump",
      lines: ["destination: gargantua", "route: unknown", "turning away from the sun. first time."],
    });
    expect(runCommand({ input: "go gargantua", context: ALL_VISITED })).toEqual({
      kind: "jump",
      lines: ["destination: gargantua", "route: unknown", "turning away from the sun. first time."],
    });
  });

  it("counts gargantua as one more than there is, once crossed", () => {
    const result = runCommand({
      input: "explore",
      context: { ...ALL_VISITED, hasCrossedHorizon: true },
    });

    expect(result.kind === "print" && result.lines.slice(-2)).toEqual([
      "  gargantua         visited",
      "progress: 6/5",
    ]);
  });

  it("keeps the secret commands out of help", () => {
    const result = runCommand({ input: "help", context: AT_HOME });

    expect(result.kind === "print" && result.lines.join("\n")).not.toMatch(/sudo|git|42/);
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
