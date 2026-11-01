import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { CockpitReveal } from "#/hooks/useExplorer";
import type { Destination } from "#/utils/destinations";
import { COCKPIT_SHIP_Y } from "#/utils/explorer";

import { AstronautIcon, CockpitWindshield, ConsoleScreen } from "./CockpitWindow.elements";
import { CockpitFloki } from "./components/CockpitFloki";
import { CockpitRadar } from "./components/CockpitRadar";
import { CockpitRadio } from "./components/CockpitRadio";
import { CockpitReadout } from "./components/CockpitReadout";
import { CockpitTerminal } from "./components/CockpitTerminal";
import { useFloki } from "./hooks/useFloki";
import { useFlokiTalk } from "./hooks/useFlokiTalk";
import { useFlokiWelcome } from "./hooks/useFlokiWelcome";
import { useTerminal } from "./hooks/useTerminal";
import { messages } from "./messages";

const FOCUSABLE_SELECTOR = "button:not(:disabled), input, a[href]:not([aria-disabled='true'])";

// The iris opens around the ship, which the camera holds this far down the screen.
const COCKPIT_STYLE = { "--ship-y": `${COCKPIT_SHIP_Y * 100}%` } as const;

function getAnimation({ reveal, isClosing }: { reveal: CockpitReveal; isClosing: boolean }) {
  if (isClosing) return "pointer-events-none animate-cockpit-close";

  switch (reveal) {
    case "flight":
      return "animate-cockpit-iris";
    case "instant":
      return "";
    default: {
      const unknownReveal: never = reveal;
      return unknownReveal;
    }
  }
}

interface CockpitWindowProps {
  reveal: CockpitReveal;
  // Opened by itself to greet the visitor: not modal, and focus stays on the page, until they
  // step in.
  isGreeting: boolean;
  onBoard: () => void;
  // Fading out while the camera pulls back: no longer a dialog.
  isClosing: boolean;
  // After `go`: the confirmation shows, and nothing closes the cockpit or takes commands.
  isLocked: boolean;
  onClose: () => void;
  // The closing cockpit has faded out.
  onClosed: () => void;
  onGo: (destination: Destination) => void;
}

// Inside the gh44 explorer, full screen: an arched windshield with two struts looks out on the
// live system, over a graphite console with the terminal on its center screen, a radar and a
// readout on its side screens, and rows of indicator lights.
export function CockpitWindow({
  reveal,
  isGreeting,
  onBoard,
  isClosing,
  isLocked,
  onClose,
  onClosed,
  onGo,
}: CockpitWindowProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  // What had focus when the cockpit opened, read on the first render before the input takes it.
  const [returnFocusTo] = useState(() => document.activeElement);
  const terminal = useTerminal();
  // The ship's computer: he answers in the terminal, and his screen shows him.
  const floki = useFloki();
  const flokiTalk = useFlokiTalk({ floki, terminal, onGo });
  useFlokiWelcome({ floki, isGreeting, text: messages.flokiWelcome });

  // The page behind takes focus again only once the cockpit is no longer open over it.
  function handleClose() {
    if (isLocked) return;
    flushSync(onClose);
    if (returnFocusTo instanceof HTMLElement) returnFocusTo.focus();
  }

  // Esc and Tab stay inside: Esc closes the cockpit, not the planet behind it.
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusables = [
      ...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []),
    ];
    const first = focusables.at(0);
    const last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function handleStepIn() {
    if (isGreeting) onBoard();
  }

  // The visitor takes the controls: Floki stops before the ship flies.
  function handleGo(destination: Destination) {
    flokiTalk.takeControls();
    onGo(destination);
  }

  function handleAnimationEnd(event: React.AnimationEvent) {
    if (isClosing && event.target === event.currentTarget) onClosed();
  }

  return (
    <div
      ref={dialogRef}
      role={isClosing ? undefined : "dialog"}
      aria-modal={isClosing || isGreeting ? undefined : true}
      aria-labelledby={titleId}
      aria-hidden={isClosing ? true : undefined}
      inert={isClosing}
      // A click on the windshield or the console keeps focus in the dialog, so Esc still reaches it.
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onFocus={handleStepIn}
      onPointerDown={handleStepIn}
      onAnimationEnd={handleAnimationEnd}
      style={COCKPIT_STYLE}
      className={`fixed inset-0 z-50 overflow-hidden text-foreground outline-none md:[--console-height:47%] ${getAnimation({ reveal, isClosing })}`}
    >
      <CockpitWindshield />
      <header className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="text-label font-bold tracking-label">
            {messages.title}
          </h2>
          <p className="flex items-center gap-2 text-xs text-muted">
            <span
              aria-hidden="true"
              className="size-1.5 animate-light-blink rounded-full bg-sage"
            />
            {messages.status}
          </p>
        </div>
        <button
          type="button"
          aria-label={messages.spacewalkLabel}
          disabled={isLocked}
          onClick={handleClose}
          className="flex h-10 items-center gap-2 rounded-full border border-rule bg-bg-subtle pr-4 pl-3 text-xs text-muted transition-colors hover:border-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40"
        >
          <AstronautIcon />
          {messages.spacewalk}
        </button>
      </header>
      <div className="absolute inset-x-0 bottom-0 max-h-[72%] rounded-t-[50%_2.5rem] border-t-8 border-surface bg-bg-subtle shadow-[0_-1px_0_var(--rule)] md:h-(--console-height) md:max-h-none md:rounded-t-[50%_4rem] md:border-t-12">
        {/* Desktop: Floki's screen over the radar, the terminal in the middle, the readout over
            the radio. Phones: Floki beside the radio, the terminal under them, no radar. */}
        <div className="mx-auto grid max-w-[96rem] grid-cols-[6rem_minmax(0,1fr)] gap-3 px-3 pt-5 pb-4 md:h-full md:grid-cols-[minmax(0,1fr)_minmax(0,46rem)_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)] md:gap-x-6 md:gap-y-3 md:px-8 md:pt-10 md:pb-6">
          <ConsoleScreen className="p-2 md:col-start-1 md:row-start-1 md:h-32 md:p-2.5">
            <CockpitFloki
              status={floki.status}
              getLevel={floki.getLevel}
              canListen={floki.canListen}
              isConversing={flokiTalk.isConversing}
              isLocked={isLocked}
              onTalk={() => void flokiTalk.talk()}
            />
          </ConsoleScreen>
          <ConsoleScreen className="hidden md:col-start-1 md:row-start-2 md:block">
            <CockpitRadar />
          </ConsoleScreen>
          <ConsoleScreen className="hidden md:col-start-3 md:row-start-1 md:block">
            <CockpitReadout />
          </ConsoleScreen>
          <ConsoleScreen className="md:col-start-3 md:row-start-2 md:flex md:flex-col">
            <CockpitRadio />
          </ConsoleScreen>
          <div className="col-span-2 flex min-h-0 flex-col md:col-span-1 md:col-start-2 md:row-span-2 md:row-start-1">
            <CockpitTerminal
              terminal={terminal}
              isLocked={isLocked}
              shouldFocus={!isGreeting}
              onAsk={(question) => void flokiTalk.ask(question)}
              onGo={handleGo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
