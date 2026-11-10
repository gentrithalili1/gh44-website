import { lazy, Suspense, useState } from "react";

import type { FlokiStatus } from "../../hooks/useFloki";
import type { TerminalLine } from "../../hooks/useTerminal";
import { messages } from "./messages";
import { COMMITS } from "./utils/commits";

const TesseractScene = lazy(() =>
  import("./components/TesseractScene").then((module) => ({ default: module.TesseractScene })),
);

// In the visitor's locale; commit dates are plain days, read as UTC so none shifts a day.
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" });

// The last thing the visitor said to Floki and what he answered, from the terminal's lines.
function getExchange(lines: readonly TerminalLine[]) {
  const lastVisitor = lines.map((line) => line.kind).lastIndexOf("visitor");
  const since = lastVisitor === -1 ? [] : lines.slice(lastVisitor);

  return {
    visitor: since.at(0)?.text,
    floki: since.filter((line) => line.kind === "floki").at(-1)?.text,
  };
}

interface TesseractProps {
  flokiStatus: FlokiStatus;
  // The browser can hear the visitor; without it they type.
  canListen: boolean;
  isConversing: boolean;
  // The cockpit terminal's lines: what was said in here is kept there too.
  lines: readonly TerminalLine[];
  onAsk: (question: string) => void;
  onTalk: () => void;
  // The way back to the cockpit.
  onReturn: () => void;
}

// Inside the black hole: a lattice of light with Floki floating in the middle, and a shelf with
// one book for every commit of this site. Floki is there to talk to, typed or out loud: he says
// what the place is, and leads the way back when asked. Pointing at a book (or moving the
// slider) shows its commit.
export function Tesseract({
  flokiStatus,
  canListen,
  isConversing,
  lines,
  onAsk,
  onTalk,
  onReturn,
}: TesseractProps) {
  const [selectedIndex, setSelectedIndex] = useState(COMMITS.length - 1);
  const [question, setQuestion] = useState("");
  // What was said before the visitor got here does not count.
  const [enteredAt] = useState(lines.length);

  const commit = COMMITS[selectedIndex];
  const exchange = getExchange(lines.slice(enteredAt));
  const isActive = isConversing || flokiStatus === "listening" || flokiStatus === "speaking";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = question.trim();
    if (text === "") return;
    setQuestion("");
    onAsk(text);
  }

  // Floki is who the visitor came to see: the line to him takes focus.
  function focusAsk(input: HTMLInputElement | null) {
    input?.focus();
  }

  if (!commit) return null;

  return (
    <section aria-label={messages.label} className="absolute inset-0 animate-void-in">
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <TesseractScene
            commitCount={COMMITS.length}
            selectedIndex={selectedIndex}
            flokiStatus={flokiStatus}
            onSelect={setSelectedIndex}
          />
        </Suspense>
      </div>
      <button
        type="button"
        onClick={onReturn}
        className="absolute top-5 right-5 h-10 rounded-full border border-rule bg-black/50 px-5 text-xs text-muted transition-colors hover:border-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:top-7 md:right-7"
      >
        {messages.back}
      </button>

      {/* The commit in view: top left, clear of the shelf; on a phone under the way back. */}
      <div className="absolute top-18 left-5 flex max-w-[min(26rem,calc(100%-2.5rem))] flex-col gap-1 rounded-lg border border-white/8 bg-black/60 px-4 py-3 text-left md:top-7 md:left-8">
        <div aria-live="polite">
          <time
            dateTime={commit.date}
            className="block text-[0.6875rem] tracking-kicker text-ochre"
          >
            {dateFormat.format(new Date(commit.date)).toLowerCase()}
          </time>
          <p className="text-sm/snug text-balance text-foreground md:text-base/snug">
            {commit.subject.toLowerCase()}
          </p>
        </div>
        <p className="text-[0.6875rem] text-faint">
          {messages.count({ index: selectedIndex + 1, total: COMMITS.length })}
        </p>
        {/* The same shelf for keyboards and small screens, where the books are hard to hit. */}
        <input
          type="range"
          aria-label={messages.shelfLabel}
          aria-valuetext={messages.bookLabel(commit)}
          min={0}
          max={COMMITS.length - 1}
          value={selectedIndex}
          onChange={(event) => setSelectedIndex(Number(event.target.value))}
          className="h-4 w-full accent-ochre"
        />
      </div>

      {/* Talking to Floki: what was said last, and the line to him. */}
      <div className="absolute inset-x-5 bottom-5 mx-auto flex max-w-xl flex-col gap-2 rounded-lg border border-white/8 bg-black/70 px-4 py-3 text-left text-xs md:bottom-8 md:text-[0.8125rem]">
        <div role="log" aria-label={messages.askLabel} className="flex flex-col gap-0.5">
          {exchange.visitor === undefined ? null : (
            <p className="text-muted">
              <span className="text-sage">{messages.visitorPrompt}</span> {exchange.visitor}
            </p>
          )}
          <p className="text-foreground">
            <span className="text-lavender">{messages.flokiPrompt}</span>{" "}
            {exchange.floki ?? (exchange.visitor === undefined ? messages.flokiLine : "")}
            <span role="status" className="text-faint">
              {messages.status[flokiStatus]}
            </span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={focusAsk}
            type="text"
            aria-label={messages.askLabel}
            placeholder={messages.askPlaceholder}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            autoComplete="off"
            className="h-9 min-w-0 flex-1 rounded-full border border-rule bg-transparent px-4 text-foreground outline-none placeholder:text-faint focus-visible:border-lavender"
          />
          {canListen ? (
            <button
              type="button"
              aria-label={isActive ? messages.stopLabel : messages.talkLabel}
              aria-pressed={isConversing}
              onClick={onTalk}
              className="h-9 shrink-0 rounded-full border border-lavender/35 bg-lavender/8 px-4 text-lavender transition-colors hover:border-lavender/70 hover:bg-lavender/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender aria-pressed:border-lavender aria-pressed:bg-lavender/20"
            >
              {isActive ? messages.stop : messages.talk}
            </button>
          ) : null}
        </form>
      </div>
    </section>
  );
}
