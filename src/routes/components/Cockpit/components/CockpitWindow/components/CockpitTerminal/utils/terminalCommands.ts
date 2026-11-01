import { DESTINATIONS, type Destination } from "#/utils/destinations";
import { PLANETS, type PlanetId, SOLAR_SYSTEM } from "#/utils/planets";

import { messages } from "../messages";

// The width of a command or destination name column, so the second column lines up.
const NAME_COLUMN = 18;

export type CommandContext = { pathname: string; visitedIds: readonly PlanetId[] };

export type CommandResult =
  | { kind: "print"; lines: readonly string[] }
  | { kind: "clear" }
  | { kind: "go"; destination: Destination; lines: readonly string[] }
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

function go({ args }: CommandParams): CommandResult {
  const [name] = args;
  if (name === undefined) {
    return print([messages.usage(messages.commands.go.usage), getDestinationList()]);
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
        messages.progress({ visited: context.visitedIds.length, total: DESTINATIONS.length }),
      ]),
  },
  go: { ...messages.commands.go, run: go },
  floki: { ...messages.commands.floki, run: floki },
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
  if (!command) return print(messages.commandNotFound(name));

  return command.run({ args, context });
}
