import { DESTINATIONS, type Destination } from "#/utils/destinations";
import { PLANETS, type PlanetId, SOLAR_SYSTEM } from "#/utils/planets";

import { messages } from "../messages";

// The width of a command or destination name column, so the second column lines up.
const NAME_COLUMN = 18;

export type CommandContext = {
  pathname: string;
  visitedIds: readonly PlanetId[];
  // Floki's ball is already out in the system.
  hasBall: boolean;
  // The visitor has been through the black hole and back.
  hasCrossedHorizon: boolean;
};

// What a secret command sets off outside the terminal.
export type TerminalEgg = "praise" | "fetch";

export type CommandResult =
  | { kind: "print"; lines: readonly string[] }
  // Floki answers, and something happens on board or outside.
  | { kind: "egg"; egg: TerminalEgg; lines: readonly string[] }
  | { kind: "clear" }
  | { kind: "go"; destination: Destination; lines: readonly string[] }
  // Into the black hole, once every planet is visited.
  | { kind: "jump"; lines: readonly string[] }
  | { kind: "ask"; question: string; lines: readonly string[] };

type CommandParams = { args: readonly string[]; context: CommandContext };

// One command: how help shows it, and what it does.
type Command = {
  usage: string;
  description: string;
  run: (params: CommandParams) => CommandResult;
};

function print(lines: readonly string[]): CommandResult {
  return { kind: "print", lines };
}

function getRow({ name, value }: { name: string; value: string }) {
  return `  ${name.padEnd(NAME_COLUMN)}${value}`;
}

function getDestinationList() {
  return messages.destinationList(DESTINATIONS.map((destination) => destination.name));
}

// Every planet is visited: the black hole shows itself.
export function hasFoundGargantua({ visitedIds }: Pick<CommandContext, "visitedIds">) {
  return visitedIds.length >= DESTINATIONS.length;
}

function go({ args, context }: CommandParams): CommandResult {
  const [name] = args;
  if (name === undefined) {
    return print([messages.usage(messages.commands.go.usage), getDestinationList()]);
  }
  if (name === messages.gargantua.name && hasFoundGargantua(context)) {
    return { kind: "jump", lines: messages.gargantua.confirm };
  }

  const destination = DESTINATIONS.find((candidate) => candidate.name === name);
  if (!destination) return print([messages.goUnknown(name), getDestinationList()]);

  return { kind: "go", destination, lines: messages.goConfirm(destination) };
}

function floki({ args }: CommandParams): CommandResult {
  const question = args.join(" ");
  if (question === "") return print([messages.usage(messages.commands.floki.usage)]);

  return { kind: "ask", question, lines: [] };
}

// Every command the terminal knows, in the order help lists them.
const COMMANDS: Readonly<Record<string, Command>> = {
  help: {
    ...messages.commands.help,
    run: () =>
      print([
        messages.commandsHeading,
        ...Object.values(COMMANDS).map(({ usage, description }) =>
          getRow({ name: usage, value: description }),
        ),
        getDestinationList(),
      ]),
  },
  clear: { ...messages.commands.clear, run: () => ({ kind: "clear" }) },
  whoami: { ...messages.commands.whoami, run: () => print(messages.whoami) },
  status: {
    ...messages.commands.status,
    run: () =>
      print(messages.shipStatus({ planetCount: SOLAR_SYSTEM.length, pageCount: PLANETS.length })),
  },
  destinations: {
    ...messages.commands.destinations,
    run: () =>
      print(DESTINATIONS.map(({ name, description }) => getRow({ name, value: description }))),
  },
  coordinates: {
    ...messages.commands.coordinates,
    run: ({ context }) => print([messages.route(context.pathname)]),
  },
  explore: {
    ...messages.commands.explore,
    run: ({ context }) =>
      print([
        ...DESTINATIONS.map(({ name }) =>
          getRow({
            name,
            value: context.visitedIds.includes(name) ? messages.visited : messages.unknown,
          }),
        ),
        ...(context.hasCrossedHorizon
          ? [getRow({ name: messages.gargantua.name, value: messages.visited })]
          : []),
        messages.progress({
          visited: context.visitedIds.length + (context.hasCrossedHorizon ? 1 : 0),
          total: DESTINATIONS.length,
        }),
      ]),
  },
  go: { ...messages.commands.go, run: go },
  floki: { ...messages.commands.floki, run: floki },
};

// `good boy`, and what else he answers to.
const PRAISED: readonly string[] = ["boy", "dog", "girl", "floki"];

// Commands help never lists: found by trying them.
const SECRET_COMMANDS: Readonly<Record<string, Command["run"]>> = {
  sudo: () => print(messages.secrets.sudo),
  rm: ({ args }) => print(args.length === 0 ? [messages.secrets.rmUsage] : messages.secrets.rm),
  git: ({ args }) =>
    print(args[0] === "blame" ? messages.secrets.gitBlame : messages.secrets.gitOther),
  "42": () => print(messages.secrets.answer),
  good: ({ args }) =>
    PRAISED.includes(args[0] ?? "")
      ? { kind: "egg", egg: "praise", lines: messages.secrets.praise }
      : print([messages.secrets.goodWhat]),
  fetch: ({ context }) => ({
    kind: "egg",
    egg: "fetch",
    lines: context.hasBall ? messages.secrets.fetchAgain : messages.secrets.fetch,
  }),
};

// What the terminal shows when the cockpit opens.
export function getWelcomeLines() {
  return [messages.welcome, getDestinationList()];
}

// One line typed at the prompt: a command name and its arguments, in any case and spacing.
export function runCommand({ input, context }: { input: string; context: CommandContext }) {
  const [name, ...args] = input.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (name === undefined) return print([]);
  const command = Object.hasOwn(COMMANDS, name) ? COMMANDS[name] : undefined;
  if (command) return command.run({ args, context });
  const secret = Object.hasOwn(SECRET_COMMANDS, name) ? SECRET_COMMANDS[name] : undefined;
  if (!secret) return print(messages.commandNotFound(name));

  return secret({ args, context });
}
