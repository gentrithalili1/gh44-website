import { useLocation } from "@tanstack/react-router";
import { useState } from "react";

import { useExploration } from "#/hooks/useExploration";

import { getWelcomeLines, runCommand } from "../../utils/terminalCommands";

// A line on the screen: a command echoed at the prompt, or what a command printed.
export type TerminalLine = { id: number; kind: "command" | "output"; text: string };

type Screen = { lines: readonly TerminalLine[]; nextLineId: number };

// Where the visitor is in the command history: typing a new line, or showing an earlier one.
type HistoryPosition = { status: "typing" } | { status: "browsing"; index: number };

function getWelcomeScreen(): Screen {
  const welcome = getWelcomeLines();

  return {
    lines: welcome.map((text, id) => ({ id, kind: "output", text })),
    nextLineId: welcome.length,
  };
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

// The cockpit's terminal: what it shows, what is typed, and the commands typed before.
export function useTerminal() {
  const location = useLocation();
  const exploration = useExploration();
  const [screen, setScreen] = useState(getWelcomeScreen);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<readonly string[]>([]);
  const [historyPosition, setHistoryPosition] = useState<HistoryPosition>({ status: "typing" });

  // Runs one command line, prints its echo and output, and returns what it asks for.
  function run(command: string) {
    const result = runCommand({
      input: command,
      context: { pathname: location.pathname, visitedIds: exploration.visitedIds },
    });
    const echo = { kind: "command", text: command.trim() } as const;
    const output = result.kind === "clear" ? [] : result.lines;

    setScreen((current) =>
      result.kind === "clear"
        ? { lines: [], nextLineId: current.nextLineId }
        : addLines({
            screen: current,
            lines: [echo, ...output.map((text) => ({ kind: "output", text }) as const)],
          }),
    );
    if (command.trim() !== "") setHistory((current) => [...current, command.trim()]);
    setHistoryPosition({ status: "typing" });
    setInput("");

    return result;
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
    showPrevious,
    showNext,
  };
}
