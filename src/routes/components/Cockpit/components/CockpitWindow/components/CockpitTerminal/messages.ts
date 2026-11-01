import { EXPLORER_NAME } from "#/utils/explorer";

export const messages = {
  title: "gh44@explorer — zsh",
  // The prompt in parts, each in its own color; it reads "gh44@explorer:~$".
  prompt: { user: "gh44@explorer", separator: ":", path: "~", symbol: "$" },
  commandLabel: "command",
  outputLabel: "terminal output",
  welcome: "welcome aboard. type help.",
  commandsHeading: "commands:",
  // How help shows each command.
  commands: {
    help: { usage: "help", description: "list commands" },
    clear: { usage: "clear", description: "clear the screen" },
    whoami: { usage: "whoami", description: "who built this ship" },
    status: { usage: "status", description: "ship and system status" },
    destinations: { usage: "destinations", description: "where you can go" },
    coordinates: { usage: "coordinates", description: "where you are" },
    explore: { usage: "explore", description: "what you have visited" },
    go: { usage: "go <destination>", description: "fly to a destination" },
    floki: { usage: "floki <question>", description: "ask the onboard computer" },
  },
  usage: (usage: string) => `usage: ${usage}`,
  whoami: ["gentrit halili", "senior frontend engineer", "pristina, kosovo"],
  shipStatus: ({ planetCount, pageCount }: { planetCount: number; pageCount: number }) => [
    `ship: ${EXPLORER_NAME}`,
    "engines: warm",
    "shields: dark mode",
    `system: ${planetCount} planets, ${pageCount} open to visitors`,
    "crew: 1, plus you",
  ],
  route: (route: string) => `route: ${route}`,
  visited: "visited",
  unknown: "unknown",
  progress: ({ visited, total }: { visited: number; total: number }) =>
    `progress: ${visited}/${total}`,
  destinationList: (names: readonly string[]) => `destinations: ${names.join(", ")}`,
  goUnknown: (name: string) => `unknown destination: ${name}`,
  goConfirm: ({ name, route }: { name: string; route: string }) => [
    `destination: ${name}`,
    `route: ${route}`,
    "navigation locked.",
    "initiating transition...",
  ],
  floki: {
    prompt: "floki>",
    visitorPrompt: "you>",
    greeting: "floki online. tap talk, or type floki <question>.",
    spokenGreeting: "Floki online. Where to?",
    quiet: "didn't catch that. tap talk and try again.",
    micDenied: "no mic access. type floki <question> instead.",
    courseSet: (name: string) => `course set for ${name}.`,
    humorSet: (humor: number) =>
      `humor setting: ${humor}%. ${humor > 80 ? "you asked for it." : "noted."}`,
    questionLimit:
      "that's my limit for this trip. reopen the cockpit to start over, or use the terminal.",
    busy: "still thinking. one question at a time.",
    rateLimited: "cooling down. too many questions for now. the terminal still works.",
    unavailable: "comms down. the terminal still works.",
  },
  commandNotFound: (name: string) => [`command not found: ${name}`, "type help for commands."],
} as const;
