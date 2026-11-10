import { EXPLORER_NAME } from "#/utils/explorer";

export const messages = {
  title: "terminal",
  prompt: "gh44-explorer>",
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
    greeting: "floki here, how can I help?",
    spokenGreeting: "Floki here, how can I help?",
    quiet: "didn't catch that. tap ask floki and try again.",
    micDenied: "no mic access. type floki <question> instead.",
    courseSet: (name: string) => `course set for ${name}.`,
    humorSet: (humor: number) =>
      `humor setting: ${humor}%. ${humor > 80 ? "you asked for it." : "noted."}`,
    radioPlaying: ({ title, artist }: { title: string; artist: string }) =>
      `on the radio: ${title} by ${artist}.`,
    radioStopped: "radio off.",
    radioUnavailable: "radio's down. no tracks on board.",
    questionLimit:
      "that's my limit for this trip. reopen the cockpit to start over, or use the terminal.",
    busy: "still thinking. one question at a time.",
    rateLimited: "cooling down. too many questions for now. the terminal still works.",
    unavailable: "comms down. the terminal still works.",
  },
  // The black hole: only a destination once every planet is visited.
  gargantua: {
    name: "gargantua",
    signal: "there's something past gh44-brain. try: go gargantua",
    confirm: ["destination: gargantua", "route: unknown", "turning away from the sun. first time."],
  },
  // Commands help never lists.
  secrets: {
    sudo: ["nice try.", "this incident will be reported to floki."],
    rm: ["deleting the solar system...", "permission denied. the sun is load-bearing."],
    rmUsage: "rm what? be brave.",
    gitBlame: ["gentrit. always gentrit."],
    gitOther: ["working tree clean. space is tidy."],
    answer: ["the answer. the question is still loading."],
    praise: ["ears up. tail would wag, if they'd built one."],
    goodWhat: "good what? finish the sentence.",
    fetch: ["ball's away. tracking it on the radar."],
    fetchAgain: ["it's still out there. your turn."],
  },
  commandNotFound: (name: string) => [`command not found: ${name}`, "type help for commands."],
} as const;
