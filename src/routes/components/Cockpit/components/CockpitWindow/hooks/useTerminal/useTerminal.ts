import { useLocation } from "@tanstack/react-router";
import { useState } from "react";

import { useExploration } from "#/hooks/useExploration";
import { useSecrets } from "#/hooks/useSecrets";

import {
  getWelcomeLines,
  hasFoundGargantua,
  runCommand,
} from "../../components/CockpitTerminal/utils/terminalCommands";

import { messages } from "../../components/CockpitTerminal/messages";

// A line on the screen: a command echoed at the prompt, what a command printed, what the
// visitor and Floki said to each other, or an alert that stands out from the rest.
export type TerminalLine = {
  id: number;
  kind: "command" | "output" | "visitor" | "floki" | "alert";
  text: string;
};

type Screen = { lines: readonly TerminalLine[]; nextLineId: number };

// Where the visitor is in the command history: typing a new line, or showing an earlier one.
type HistoryPosition = { status: "typing" } | { status: "browsing"; index: number };

// With a signal, Floki has picked up the black hole and says so.
function getWelcomeScreen({ hasSignal }: { hasSignal: boolean }): Screen {
  const lines = [
    ...getWelcomeLines().map((text) => ({ kind: "output", text }) as const),
    { kind: "floki", text: messages.floki.greeting } as const,
    ...(hasSignal
      ? [
          { kind: "alert", text: messages.gargantua.alert } as const,
          { kind: "floki", text: messages.gargantua.signal } as const,
          { kind: "alert", text: messages.gargantua.invite } as const,
        ]
      : []),
  ];

  return { lines: lines.map((line, id) => ({ ...line, id })), nextLineId: lines.length };
}

function addLines({
  screen,
  lines,
}: {
  screen: Screen;
  lines: readonly Omit<TerminalLine, "id">[];
}) {
  return {
    lines: [
      ...screen.lines,
      ...lines.map((line, offset) => ({ ...line, id: screen.nextLineId + offset })),
    ],
    nextLineId: screen.nextLineId + lines.length,
  };
}

export type Terminal = ReturnType<typeof useTerminal>;

// The cockpit's terminal: what it shows, what is typed, and the commands typed before.
export function useTerminal() {
  const location = useLocation();
  const exploration = useExploration();
  const secrets = useSecrets();
  const [screen, setScreen] = useState(() =>
    getWelcomeScreen({
      hasSignal: hasFoundGargantua(exploration) && !secrets.hasCrossedHorizon,
    }),
  );
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<readonly string[]>([]);
  const [historyPosition, setHistoryPosition] = useState<HistoryPosition>({ status: "typing" });

  // Runs one command line, prints its echo and output, and returns what it asks for.
  function run(command: string) {
    const result = runCommand({
      input: command,
      context: {
        pathname: location.pathname,
        visitedIds: exploration.visitedIds,
        hasBall: secrets.hasBall,
        hasCrossedHorizon: secrets.hasCrossedHorizon,
      },
    });
    const echo = { kind: "command", text: command.trim() } as const;
    const output = result.kind === "clear" ? [] : result.lines;
    // An egg is Floki talking.
    const outputKind = result.kind === "egg" ? "floki" : "output";

    setScreen((current) =>
      result.kind === "clear"
        ? { lines: [], nextLineId: current.nextLineId }
        : addLines({
            screen: current,
            lines: [echo, ...output.map((text) => ({ kind: outputKind, text }) as const)],
          }),
    );
    if (command.trim() !== "") setHistory((current) => [...current, command.trim()]);
    setHistoryPosition({ status: "typing" });
    setInput("");

    return result;
  }

  // Adds lines that no command printed, such as Floki's answers.
  function print(lines: readonly Omit<TerminalLine, "id">[]) {
    setScreen((current) => addLines({ screen: current, lines }));
  }

  function showHistoryEntry(index: number) {
    setHistoryPosition({ status: "browsing", index });
    setInput(history[index] ?? "");
  }

  function showPrevious() {
    if (history.length === 0) return;
    const index = historyPosition.status === "browsing" ? historyPosition.index : history.length;
    showHistoryEntry(Math.max(0, index - 1));
  }

  function showNext() {
    if (historyPosition.status === "typing") return;
    const index = historyPosition.index + 1;
    if (index < history.length) {
      showHistoryEntry(index);
      return;
    }
    setHistoryPosition({ status: "typing" });
    setInput("");
  }

  return {
    lines: screen.lines,
    input,
    setInput,
    run,
    print,
    showPrevious,
    showNext,
  };
}
