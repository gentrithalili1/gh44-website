import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { CockpitReveal } from "#/hooks/useExplorer";
import type { Destination } from "#/utils/destinations";
import { COCKPIT_SHIP_Y } from "#/utils/explorer";

import {
  AstronautIcon,
  CockpitWindshield,
  ConsoleLights,
  ConsoleScreen,
} from "./CockpitWindow.elements";
import { CockpitFloki } from "./components/CockpitFloki";
import { CockpitRadar } from "./components/CockpitRadar";
import { CockpitRadio } from "./components/CockpitRadio";
import { CockpitTerminal } from "./components/CockpitTerminal";
import { useFloki } from "./hooks/useFloki";
import { useFlokiTalk } from "./hooks/useFlokiTalk";
import { useFlokiWelcome } from "./hooks/useFlokiWelcome";
import { useTerminal } from "./hooks/useTerminal";
import { messages } from "./messages";

const FOCUSABLE_SELECTOR = "button:not(:disabled), input, a[href]:not([aria-disabled='true'])";

// The iris opens around the ship, which the camera holds this far down the screen. The screens
// power on once the cockpit is in view: after the flight in, or right away.
const SHIP_Y = `${COCKPIT_SHIP_Y * 100}%`;
const COCKPIT_STYLES = {
  flight: { "--ship-y": SHIP_Y, "--power-delay": "1000ms" },
  instant: { "--ship-y": SHIP_Y, "--power-delay": "250ms" },
} as const satisfies Record<CockpitReveal, object>;

type GetAnimationParams = { reveal: CockpitReveal; isClosing: boolean; isLocked: boolean };

function getAnimation({ reveal, isClosing, isLocked }: GetAnimationParams) {
  if (isClosing) return "pointer-events-none animate-cockpit-close";
  // After `go` the engine opens up: the cockpit shakes until it closes.
  if (isLocked) return "motion-safe:animate-cockpit-rumble";

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
// live system, over a graphite console of bezeled screens: the terminal in the middle, Floki on
// the left, the radar and the radio on the right.
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

  // The visitor looks around: the windshield shifts a little against the console.
  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const { style } = event.currentTarget;
    style.setProperty("--look-x", ((event.clientX / window.innerWidth) * 2 - 1).toFixed(3));
    style.setProperty("--look-y", ((event.clientY / window.innerHeight) * 2 - 1).toFixed(3));
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
      onPointerMove={handlePointerMove}
      onAnimationEnd={handleAnimationEnd}
      data-reveal={reveal}
      data-power={isClosing ? "off" : "on"}
      // Clipped, not scrollable: focusing the terminal while the console rises must not scroll it.
      style={COCKPIT_STYLES[reveal]}
      className={`group/cockpit fixed inset-0 z-50 overflow-clip text-foreground outline-none md:[--console-height:47%] ${getAnimation({ reveal, isClosing, isLocked })}`}
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
      <div className="absolute inset-x-0 bottom-0 max-h-[72%] rounded-t-[50%_2.5rem] border-t-8 border-surface bg-bg-subtle shadow-[0_-1px_0_var(--rule)] group-data-[power=off]/cockpit:animate-console-out group-data-[reveal=flight]/cockpit:animate-console-in md:h-(--console-height) md:max-h-none md:rounded-t-[50%_4rem] md:border-t-12">
        {/* Desktop: Floki on the left, the terminal in the middle, the radar over the radio on
            the right. Phones: Floki beside the radar and the radio, the terminal under them. */}
        <div className="mx-auto grid max-w-[96rem] grid-cols-[7rem_minmax(0,1fr)] gap-2.5 px-3 pt-5 pb-4 md:h-full md:grid-cols-[minmax(0,1fr)_minmax(0,40rem)_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)] md:gap-x-6 md:gap-y-3 md:px-8 md:pt-9 md:pb-6">
          <ConsoleScreen
            label={messages.screens.floki}
            powerOrder={0}
            className="row-span-2 md:col-start-1 md:row-start-1"
            screenClassName="flex flex-col p-2 md:p-3"
          >
            <CockpitFloki
              status={floki.status}
              getLevel={floki.getLevel}
              canListen={floki.canListen}
              isConversing={flokiTalk.isConversing}
              isLocked={isLocked}
              onTalk={() => void flokiTalk.talk()}
            />
          </ConsoleScreen>
          <ConsoleScreen
            label={messages.screens.radar}
            powerOrder={2}
            className="md:col-start-3 md:row-start-1"
            screenClassName="p-2 md:p-3"
          >
            <CockpitRadar />
          </ConsoleScreen>
          <ConsoleScreen
            label={messages.screens.radio}
            powerOrder={3}
            className="md:col-start-3 md:row-start-2"
            screenClassName="flex flex-col p-2 md:p-3"
          >
            <CockpitRadio />
          </ConsoleScreen>
          <ConsoleScreen
            label={messages.screens.terminal}
            powerOrder={1}
            indicator={<ConsoleLights />}
            className="col-span-2 h-[min(14rem,27dvh)] md:col-span-1 md:col-start-2 md:row-span-2 md:row-start-1 md:h-auto"
            screenClassName="flex flex-col"
          >
            <CockpitTerminal
              terminal={terminal}
              isLocked={isLocked}
              shouldFocus={!isGreeting}
              onAsk={(question) => void flokiTalk.ask(question)}
              onGo={handleGo}
            />
          </ConsoleScreen>
        </div>
      </div>
    </div>
  );
}
