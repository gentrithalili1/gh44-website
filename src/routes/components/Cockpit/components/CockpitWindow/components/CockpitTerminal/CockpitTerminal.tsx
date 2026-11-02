import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";

import type { Destination } from "#/utils/destinations";

import type { Terminal, TerminalLine } from "../../hooks/useTerminal";
import {
  FlokiPrompt,
  TerminalCursor,
  TerminalPrompt,
  VisitorPrompt,
} from "./CockpitTerminal.elements";
import { messages } from "./messages";
import { getLineSegments } from "./utils/terminalLinks";

interface CockpitTerminalProps {
  terminal: Terminal;
  // After `go`: the terminal shows the confirmation and takes no more commands.
  isLocked: boolean;
  // A greeting cockpit leaves focus where it was: the command line waits for the visitor.
  shouldFocus: boolean;
  // `floki <question>`: Floki answers in the terminal.
  onAsk: (question: string) => void;
  onGo: (destination: Destination) => void;
}

// The nav console on the center screen, the ship's command line. Every destination it prints is a
// link: clicking one runs `go` for it.
export function CockpitTerminal({
  terminal,
  isLocked,
  shouldFocus,
  onAsk,
  onGo,
}: CockpitTerminalProps) {
  // Where the caret is in the command line; null keeps it at the end.
  const [caretIndex, setCaretIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const caret = Math.min(caretIndex ?? terminal.input.length, terminal.input.length);
  const beforeCaret = terminal.input.slice(0, caret);
  const underCaret = terminal.input.at(caret) ?? " ";
  const afterCaret = terminal.input.slice(caret + 1);

  function handleRun(command: string) {
    const result = terminal.run(command);
    setCaretIndex(null);
    switch (result.kind) {
      case "print":
      case "clear":
        return;
      case "go":
        onGo(result.destination);
        return;
      case "ask":
        onAsk(result.question);
        return;
      default: {
        const unknownResult: never = result;
        return unknownResult;
      }
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isLocked) return;
    handleRun(terminal.input);
  }

  function handleInputKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      terminal.showPrevious();
      setCaretIndex(null);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      terminal.showNext();
      setCaretIndex(null);
    }
  }

  // Selecting output to copy it still works: only a plain click moves to the prompt.
  function handleScreenClick(event: React.MouseEvent) {
    const isOnControl = event.target instanceof Element && event.target.closest("a, input");
    if (isOnControl || window.getSelection()?.isCollapsed === false) return;
    inputRef.current?.focus();
  }

  function handleSelect(event: React.SyntheticEvent<HTMLInputElement>) {
    setCaretIndex(event.currentTarget.selectionStart);
  }

  // The link still points at the page (open in a new tab works); a plain click flies there.
  function handleDestinationClick({
    event,
    destination,
  }: {
    event: React.MouseEvent;
    destination: Destination;
  }) {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    if (isLocked) return;
    handleRun(`go ${destination.name}`);
  }

  function renderLine(line: TerminalLine) {
    switch (line.kind) {
      case "command":
        return (
          <>
            <TerminalPrompt /> {line.text}
          </>
        );
      case "visitor":
        return (
          <>
            <VisitorPrompt /> {line.text}
          </>
        );
      case "floki":
        return (
          <>
            <FlokiPrompt /> {line.text}
          </>
        );
      case "output":
        return renderOutput(line);
      default: {
        const unknownKind: never = line.kind;
        return unknownKind;
      }
    }
  }

  function renderOutput(line: TerminalLine) {
    return getLineSegments(line.text).map((segment) => {
      if (segment.kind === "text") return segment.text;
      const { destination } = segment;
      return (
        <Link
          key={segment.start}
          to="/$planetId"
          params={{ planetId: destination.name }}
          title={destination.description}
          aria-disabled={isLocked}
          onClick={(event) => handleDestinationClick({ event, destination })}
          className="rounded-xs whitespace-nowrap text-terracotta underline decoration-terracotta/40 decoration-dotted underline-offset-4 transition-colors hover:text-terracotta-vivid hover:decoration-terracotta-vivid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta aria-disabled:cursor-default aria-disabled:no-underline"
        >
          {destination.name}
        </Link>
      );
    });
  }

  return (
    <section aria-label={messages.title} className="flex min-h-0 w-full flex-1 flex-col">
      {/* Reversed, so the newest line stays in view as lines arrive. A click anywhere in the
          window types at the prompt, like a terminal. */}
      <div
        onClick={handleScreenClick}
        className="flex min-h-0 flex-1 cursor-text flex-col-reverse overflow-y-auto p-3 text-xs/[1.6] text-foreground md:text-[0.8125rem]/[1.65] selection:bg-terracotta/30 [scrollbar-color:var(--rule)_transparent] [scrollbar-width:thin] md:p-4"
      >
        <div className="mb-auto">
          <div role="log" aria-label={messages.outputLabel}>
            {terminal.lines.map((line) => (
              <p key={line.id} className="break-words whitespace-pre-wrap">
                {renderLine(line)}
              </p>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <label className="flex items-center gap-2">
              <span aria-hidden="true">
                <TerminalPrompt />
              </span>
              <span className="sr-only">{messages.commandLabel}</span>
              <span className="group relative flex min-w-0 flex-1">
                <input
                  ref={inputRef}
                  readOnly={isLocked}
                  autoFocus={shouldFocus}
                  data-cockpit-command=""
                  value={terminal.input}
                  onChange={(event) => {
                    terminal.setInput(event.target.value);
                    setCaretIndex(event.target.selectionStart);
                  }}
                  onSelect={handleSelect}
                  onKeyDown={handleInputKeyDown}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  className="w-full min-w-0 bg-transparent text-transparent caret-transparent outline-none selection:bg-terracotta/30"
                />
                {/* What was typed, drawn again with a block cursor at the caret. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre"
                >
                  {beforeCaret}
                  {isLocked ? underCaret : <TerminalCursor>{underCaret}</TerminalCursor>}
                  {afterCaret}
                </span>
              </span>
            </label>
          </form>
        </div>
      </div>
    </section>
  );
}
