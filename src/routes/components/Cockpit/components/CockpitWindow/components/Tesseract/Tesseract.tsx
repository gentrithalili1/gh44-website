import { lazy, Suspense, useState } from "react";

import { messages } from "./messages";
import { COMMITS } from "./utils/commits";

const TesseractScene = lazy(() =>
  import("./components/TesseractScene").then((module) => ({ default: module.TesseractScene })),
);

// In the visitor's locale; commit dates are plain days, read as UTC so none shifts a day.
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" });
// He stays happy this long after a book is picked: long enough to see his tail go.
const PICK_SECONDS = 0.9;

interface TesseractProps {
  // The way back to the cockpit.
  onReturn: () => void;
}

// Inside the black hole: a lattice of light with Floki floating in the middle, and a shelf with
// one book for every commit of this site. Pointing at a book (or moving the slider) shows its
// commit; picking one sends the message back, which is the way out, like the button.
export function Tesseract({ onReturn }: TesseractProps) {
  const [selectedIndex, setSelectedIndex] = useState(COMMITS.length - 1);
  const [isLeaving, setIsLeaving] = useState(false);

  const commit = COMMITS[selectedIndex];

  // The book is picked: a beat for Floki's tail, then back.
  function handlePick(index: number) {
    if (isLeaving) return;
    setSelectedIndex(index);
    setIsLeaving(true);
    setTimeout(onReturn, PICK_SECONDS * 1000);
  }

  // The way back is the first thing a keyboard reaches in there.
  function focusBack(button: HTMLButtonElement | null) {
    button?.focus();
  }

  if (!commit) return null;

  return (
    <section aria-label={messages.label} className="absolute inset-0 animate-void-in">
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <TesseractScene
            commitCount={COMMITS.length}
            selectedIndex={selectedIndex}
            isHappy={isLeaving}
            onSelect={setSelectedIndex}
            onPick={handlePick}
          />
        </Suspense>
      </div>
      <button
        ref={focusBack}
        type="button"
        onClick={onReturn}
        className="absolute top-5 right-5 h-10 rounded-full border border-rule bg-black/50 px-5 text-xs text-muted transition-colors hover:border-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:top-7 md:right-7"
      >
        {messages.back}
      </button>
      {/* Top left, clear of the shelf; on a phone it sits under the way back. */}
      <div className="absolute top-18 left-5 flex max-w-[min(30rem,calc(100%-2.5rem))] flex-col gap-1 rounded-lg border border-white/8 bg-black/60 px-4 py-3 text-left md:top-7 md:left-8">
        <div aria-live="polite">
          <time
            dateTime={commit.date}
            className="block text-[0.6875rem] tracking-kicker text-ochre"
          >
            {dateFormat.format(new Date(commit.date)).toLowerCase()}
          </time>
          <p className="text-base/snug text-balance text-foreground md:text-lg/snug">
            {commit.subject.toLowerCase()}
          </p>
        </div>
        <p className="text-[0.6875rem] text-faint">
          {messages.count({ index: selectedIndex + 1, total: COMMITS.length })} ·{" "}
          <span className="text-lavender">{messages.flokiPrompt}</span> {messages.flokiLine}
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
          className="mt-1 h-4 w-full accent-ochre"
        />
      </div>
    </section>
  );
}
