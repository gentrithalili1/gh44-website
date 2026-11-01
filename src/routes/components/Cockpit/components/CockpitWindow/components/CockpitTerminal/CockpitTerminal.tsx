import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

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
  type Floki,
  type FlokiFailureReason,
  type FlokiHearing,
  type FlokiOutcome,
} from "../../hooks/useFloki";
import { type TerminalLine, useTerminal } from "./hooks/useTerminal";
import { messages } from "./messages";
import { getLineSegments } from "./utils/terminalLinks";

// Two turns in a row with nothing heard end a conversation.
const MAX_QUIET_TURNS = 2;

interface CockpitTerminalProps {
  // After `go`: the terminal shows the confirmation and takes no more commands.
  isLocked: boolean;
  // A greeting cockpit leaves focus where it was: the command line waits for the visitor.
  shouldFocus: boolean;
  // The cockpit's Floki, shared with his screen above the radar.
  floki: Floki;
  onGo: (destination: Destination) => void;
}

// A zsh window in the gh44 Warp theme on the console's center screen. Every destination it prints
// is a link: clicking one runs `go` for it.
export function CockpitTerminal({ isLocked, shouldFocus, floki, onGo }: CockpitTerminalProps) {
  const terminal = useTerminal();
  // A conversation goes on, turn after turn, until it ends; a newer one replaces it.
  const [conversation, setConversation] = useState<"off" | "on">("off");
  const conversationIdRef = useRef(0);

  // Closing the cockpit ends the conversation.
  useEffect(() => {
    return () => {
      conversationIdRef.current += 1;
    };
  }, []);
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
      case "cancelled":
        return undefined;
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
      case "questionLimit":
        return messages.floki.questionLimit;
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

  // Floki answers on screen and out loud, and flies once he has said it. Returns whether the
  // conversation can go on.
  async function handleAsk(question: string) {
    const outcome = await floki.ask(question);
    const line = getFlokiLine(outcome);
    if (line === undefined) return false;
    terminal.print([{ kind: "floki", text: line }]);
    if (outcome.status === "failed") return false;
    // Cut off by a newer question, a typed go or closing the cockpit: that decides instead.
    if ((await floki.speak(line)) === "interrupted") return false;
    const destination =
      outcome.status === "answered" || outcome.status === "navigating"
        ? outcome.destination
        : undefined;
    if (!destination) return true;
    onGo(destination);
    return false;
  }

  // What Floki prints when a turn at the mic gave no question; nothing when it did.
  function getHearingLine(hearing: FlokiHearing) {
    switch (hearing.status) {
      case "heard":
        return undefined;
      case "quiet":
      case "failed":
        return messages.floki.goingQuiet;
      case "denied":
        return messages.floki.micDenied;
      default: {
        const unknownHearing: never = hearing;
        return unknownHearing;
      }
    }
  }

  function endConversation() {
    conversationIdRef.current += 1;
    setConversation("off");
  }

  // Talk starts a conversation: Floki listens, answers, and listens again, until the visitor
  // taps stop, he flies somewhere, or he hears nothing twice in a row. He never listens while
  // he speaks, so he can't hear himself.
  async function handleTalk() {
    if (conversation === "on") {
      endConversation();
      floki.stop();
      floki.stopListening();
      return;
    }
    conversationIdRef.current += 1;
    const conversationId = conversationIdRef.current;
    function isCurrent() {
      return conversationId === conversationIdRef.current;
    }
    setConversation("on");
    // Stopped during the greeting: the mic stays closed.
    if (!floki.hasGreeted && (await floki.greet(messages.floki.spokenGreeting)) === "interrupted") {
      return;
    }
    let quietTurns = 0;
    while (isCurrent()) {
      const hearing = await floki.listen();
      if (!isCurrent()) return;
      if (hearing.status === "heard") {
        quietTurns = 0;
        terminal.print([{ kind: "visitor", text: hearing.text }]);
        if (!(await handleAsk(hearing.text))) break;
        continue;
      }
      if (hearing.status !== "denied") quietTurns += 1;
      if (hearing.status === "denied" || quietTurns >= MAX_QUIET_TURNS) {
        terminal.print([
          { kind: "floki", text: getHearingLine(hearing) ?? messages.floki.goingQuiet },
        ]);
        break;
      }
    }
    if (isCurrent()) endConversation();
  }

  function handleRun(command: string) {
    const result = terminal.run(command);
    setCaretIndex(null);
    switch (result.kind) {
      case "print":
      case "clear":
        return;
      case "go":
        // The visitor takes the controls: Floki's pending answer can't fly anywhere else.
        endConversation();
        floki.stop();
        floki.stopListening();
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
        isConversing={conversation === "on"}
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
