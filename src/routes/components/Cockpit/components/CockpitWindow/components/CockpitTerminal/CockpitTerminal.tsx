import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";

import type { Destination } from "#/utils/destinations";

import {
  FlokiPrompt,
  TerminalCursor,
  TerminalPrompt,
  TerminalTitleBar,
  VisitorPrompt,
} from "./CockpitTerminal.elements";
import { TerminalFloki } from "./components/TerminalFloki";
import {
  type FlokiFailureReason,
  type FlokiHearing,
  type FlokiOutcome,
  useFloki,
} from "./hooks/useFloki";
import { type TerminalLine, useTerminal } from "./hooks/useTerminal";
import { messages } from "./messages";
import { getLineSegments } from "./utils/terminalLinks";

interface CockpitTerminalProps {
  // After `go`: the terminal shows the confirmation and takes no more commands.
  isLocked: boolean;
  onGo: (destination: Destination) => void;
}

// A zsh window in the gh44 Warp theme on the console's center screen. Every destination it prints
// is a link: clicking one runs `go` for it.
export function CockpitTerminal({ isLocked, onGo }: CockpitTerminalProps) {
  const terminal = useTerminal();
  const floki = useFloki();
  // Floki says hello out loud once, on the first tap of talk.
  const [hasGreeted, setHasGreeted] = useState(false);
  // Where the caret is in the command line; null keeps it at the end.
  const [caretIndex, setCaretIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const caret = Math.min(caretIndex ?? terminal.input.length, terminal.input.length);
  const beforeCaret = terminal.input.slice(0, caret);
  const underCaret = terminal.input.at(caret) ?? " ";
  const afterCaret = terminal.input.slice(caret + 1);

  function getFlokiLine(outcome: FlokiOutcome) {
    switch (outcome.status) {
      case "answered":
        return outcome.say;
      case "navigating":
        return messages.floki.courseSet(outcome.destination.name);
      case "humorSet":
        return messages.floki.humorSet(outcome.humor);
      case "failed":
        return getFlokiFailure(outcome.reason);
      default: {
        const unknownOutcome: never = outcome;
        return unknownOutcome;
      }
    }
  }

  function getFlokiFailure(reason: FlokiFailureReason) {
    switch (reason) {
      case "busy":
        return messages.floki.busy;
      case "rateLimited":
        return messages.floki.rateLimited;
      case "unavailable":
        return messages.floki.unavailable;
      default: {
        const unknownReason: never = reason;
        return unknownReason;
      }
    }
  }

  // Floki answers on screen and out loud, and flies once he has said it.
  async function handleAsk(question: string) {
    const outcome = await floki.ask(question);
    const line = getFlokiLine(outcome);
    terminal.print([{ kind: "floki", text: line }]);
    if (outcome.status === "failed") return;
    // Cut off by a newer question: that one decides where to go.
    if ((await floki.speak(line)) === "interrupted") return;
    const destination =
      outcome.status === "answered" || outcome.status === "navigating"
        ? outcome.destination
        : undefined;
    if (destination) onGo(destination);
  }

  // What Floki prints when a turn at the mic gave no question; nothing when it did.
  function getHearingLine(hearing: FlokiHearing) {
    switch (hearing.status) {
      case "heard":
        return undefined;
      case "quiet":
      case "failed":
        return messages.floki.quiet;
      case "denied":
        return messages.floki.micDenied;
      default: {
        const unknownHearing: never = hearing;
        return unknownHearing;
      }
    }
  }

  // Talk opens the mic for one sentence; while Floki listens or speaks, it stops him instead.
  async function handleTalk() {
    if (floki.status === "listening") {
      floki.stopListening();
      return;
    }
    if (floki.status === "speaking") {
      floki.stopSpeaking();
      return;
    }
    if (!hasGreeted) {
      setHasGreeted(true);
      await floki.speak(messages.floki.spokenGreeting);
    }
    const hearing = await floki.listen();
    if (hearing.status === "heard") {
      terminal.print([{ kind: "visitor", text: hearing.text }]);
      await handleAsk(hearing.text);
      return;
    }
    const line = getHearingLine(hearing);
    if (line) terminal.print([{ kind: "floki", text: line }]);
  }

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
        void handleAsk(result.question);
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
    <section
      aria-label={messages.title}
      className="flex max-h-[min(20rem,38dvh)] w-full min-h-0 flex-col overflow-hidden rounded-lg border border-rule bg-night shadow-[0_18px_40px_-16px_rgb(0_0_0/0.7)] md:h-full md:max-h-none"
    >
      <TerminalTitleBar />
      <TerminalFloki
        status={floki.status}
        canListen={floki.canListen}
        isLocked={isLocked}
        getLevel={floki.getLevel}
        onTalk={() => void handleTalk()}
      />
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
                  autoFocus
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
