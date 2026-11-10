import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { CockpitReveal } from "#/hooks/useExplorer";
import { useExploration } from "#/hooks/useExploration";
import { findSecret, useSecrets } from "#/hooks/useSecrets";
import { DESTINATIONS } from "#/utils/destinations";
import type { Destination } from "#/utils/destinations";
import { useSpaceMode } from "#/hooks/useSpaceMode";
import { useMusic } from "#/routes/hooks/useMusic";
import { COCKPIT_SHIP_Y, GARGANTUA_YEARS } from "#/utils/explorer";

import {
  AstronautIcon,
  DashboardLip,
  DashboardPlates,
  PanelIcon,
  PedestalKeys,
  CockpitWindshield,
  ConsoleLights,
  ConsoleScreen,
} from "./CockpitWindow.elements";
import { CockpitFloki } from "./components/CockpitFloki";
import { EarthClock } from "./components/EarthClock";
import { Tesseract } from "./components/Tesseract";
import { CockpitRadar } from "./components/CockpitRadar";
import { CockpitRadio } from "./components/CockpitRadio";
import { CockpitTerminal, type TerminalEgg } from "./components/CockpitTerminal";
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
  // The trip into the black hole: flying in, the cockpit goes dark; inside there is only black
  // and the way back.
  jumpStatus: "idle" | "jumping" | "inside" | "returning";
  // Starts that flight; `onArrive` runs once the visitor is back.
  onJump: (onArrive: () => void) => void;
  // The way back from inside.
  onReturn: () => void;
  // The years that passed on Earth meanwhile.
  earthYearsPassed: number;
}

// What plays on the way into the black hole, if the radio is on.
const JUMP_TRACK_TITLE = "s.t.a.y.";

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
  jumpStatus,
  onJump,
  onReturn,
  earthYearsPassed,
}: CockpitWindowProps) {
  const titleId = useId();
  const panelId = useId();
  // The visitor can slide the console away for the whole view, and back.
  const [panel, setPanel] = useState<"shown" | "hidden">("shown");
  const dialogRef = useRef<HTMLDivElement>(null);
  // What had focus when the cockpit opened, read on the first render before the input takes it.
  const [returnFocusTo] = useState(() => document.activeElement);
  const terminal = useTerminal();
  // The ship's computer: he answers in the terminal, and his screen shows him.
  const floki = useFloki({ place: jumpStatus === "inside" ? "tesseract" : "cockpit" });
  const flokiTalk = useFlokiTalk({ floki, terminal, onGo, onBack: onReturn });
  useFlokiWelcome({ floki, isGreeting, text: messages.flokiWelcome });
  const [praiseCount, setPraiseCount] = useState(0);
  const exploration = useExploration();
  // With the 3D scene, the inside of the black hole is the tesseract; without it, the dark.
  const spaceMode = useSpaceMode();
  const secrets = useSecrets();
  // Every planet visited, and the black hole still ahead: the cockpit says so.
  const hasSignal =
    exploration.visitedIds.length >= DESTINATIONS.length && !secrets.hasCrossedHorizon;
  const music = useMusic();
  // Back from the black hole: the dark lifts and the screens power on again.
  const [hasReturned, setHasReturned] = useState(false);

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

  // Into the black hole (an easter egg): Floki stops, the radio finds the right track, and on
  // the other side the terminal says what it cost.
  function handleJump() {
    flokiTalk.takeControls();
    setHasReturned(false);
    const trackIndex = music.tracks.findIndex((track) => track.title === JUMP_TRACK_TITLE);
    if (music.status === "playing" && trackIndex >= 0) void music.playTrack(trackIndex);
    onJump(() => {
      findSecret("horizon");
      setHasReturned(true);
      terminal.print([
        { kind: "floki", text: messages.jumpArrived(GARGANTUA_YEARS) },
        { kind: "output", text: messages.jumpProgress },
      ]);
    });
  }

  // Typed to Floki inside the tesseract: kept in the terminal like what is said out loud.
  function handleTesseractAsk(question: string) {
    terminal.print([{ kind: "visitor", text: question }]);
    void flokiTalk.ask(question);
  }

  function getJumpPhase() {
    switch (jumpStatus) {
      case "jumping":
        return "on";
      case "inside":
        return "inside";
      // Flying back out: the dark lifts at once, and stays lifted once home.
      case "returning":
        return "back";
      case "idle":
        return hasReturned ? "back" : undefined;
      default: {
        const unknownStatus: never = jumpStatus;
        return unknownStatus;
      }
    }
  }

  // The way back is the only thing in there: it takes focus as it appears.
  function focusVoidBack(button: HTMLButtonElement | null) {
    button?.focus();
  }

  function handleEgg(egg: TerminalEgg) {
    switch (egg) {
      case "praise":
        setPraiseCount((count) => count + 1);
        return;
      case "fetch":
        findSecret("ball");
        return;
      default: {
        const unknownEgg: never = egg;
        return unknownEgg;
      }
    }
  }

  // Hidden by the visitor, and on every launch and jump: the console slides away first, so the
  // flight shows through the whole windshield.
  const isPanelHidden = panel === "hidden" || isLocked;

  function handlePanelToggle() {
    setPanel((current) => (current === "shown" ? "hidden" : "shown"));
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
      data-jump={getJumpPhase()}
      // Clipped, not scrollable: focusing the terminal while the console rises must not scroll it.
      style={COCKPIT_STYLES[reveal]}
      className={`group/cockpit fixed inset-0 z-50 overflow-clip text-foreground outline-none md:[--console-height:47%] ${getAnimation({ reveal, isClosing, isLocked })}`}
    >
      <CockpitWindshield />
      {/* The black hole's shadow takes the whole cockpit at the end of the flight in (a little
          past its edges: the cockpit is still shaking), and lifts once the ship is back. */}
      <div className="pointer-events-none absolute -inset-1 z-20 flex flex-col items-center justify-center gap-5 bg-black opacity-0 group-data-[jump=back]/cockpit:animate-jump-back group-data-[jump=inside]/cockpit:pointer-events-auto group-data-[jump=inside]/cockpit:opacity-100 group-data-[jump=on]/cockpit:animate-jump-black">
        {jumpStatus === "inside" && spaceMode === "scene" ? (
          <Tesseract
            flokiStatus={floki.status}
            canListen={floki.canListen}
            isConversing={flokiTalk.isConversing}
            lines={terminal.lines}
            onAsk={handleTesseractAsk}
            onTalk={() => void flokiTalk.talk()}
            onReturn={onReturn}
          />
        ) : null}
        {jumpStatus === "inside" && spaceMode === "static" ? (
          <>
            <p className="animate-void-in text-xs text-faint">{messages.voidLine}</p>
            <button
              ref={focusVoidBack}
              type="button"
              onClick={onReturn}
              className="h-10 animate-void-in rounded-full border border-rule px-5 text-xs text-muted transition-colors hover:border-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {messages.voidBack}
            </button>
          </>
        ) : null}
      </div>
      <header className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 md:gap-4 md:p-6">
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="text-label font-bold tracking-label">
            {messages.title}
          </h2>
          <p
            data-signal={hasSignal ? "" : undefined}
            className="flex items-center gap-2 text-xs text-muted data-signal:text-ochre"
          >
            <span
              aria-hidden="true"
              className="size-1.5 animate-light-blink rounded-full bg-sage in-data-signal:bg-ochre in-data-signal:shadow-[0_0_6px_var(--ochre)]"
            />
            {hasSignal ? messages.statusSignal : messages.status}
          </p>
          <EarthClock yearsPassed={earthYearsPassed} />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-expanded={!isPanelHidden}
            aria-controls={panelId}
            disabled={isLocked}
            onClick={handlePanelToggle}
            className="flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full border border-rule bg-bg-subtle px-3 text-xs whitespace-nowrap md:pr-4 text-muted transition-colors hover:border-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40"
          >
            <PanelIcon direction={isPanelHidden ? "up" : "down"} />
            {/* Phones show the chevron alone: the header has little room. */}
            <span className="max-md:sr-only">
              {isPanelHidden ? messages.panelShow : messages.panelHide}
            </span>
          </button>
          <button
            type="button"
            aria-label={messages.spacewalkLabel}
            disabled={isLocked}
            onClick={handleClose}
            className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-rule bg-bg-subtle px-3 text-xs whitespace-nowrap md:pr-4 text-muted transition-colors hover:border-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40"
          >
            <AstronautIcon />
            <span className="max-md:sr-only">{messages.spacewalk}</span>
          </button>
        </div>
      </header>
      {/* Slides out of the way (its own `transform`, apart from the boarding's `translate`). */}
      <div
        id={panelId}
        data-panel={isPanelHidden ? "hidden" : "shown"}
        inert={isPanelHidden}
        aria-hidden={isPanelHidden ? true : undefined}
        className="absolute inset-x-0 bottom-0 max-h-[86%] rounded-t-[50%_1.5rem] border-t-8 border-surface bg-bg-subtle bg-[linear-gradient(to_bottom,var(--surface),var(--bg-subtle)_30%)] shadow-[0_-1px_0_var(--rule),0_-18px_40px_-12px_rgb(0_0_0/0.8)] transition-transform duration-500 ease-space group-data-[power=off]/cockpit:animate-console-out group-data-[reveal=flight]/cockpit:animate-console-in data-[panel=hidden]:[transform:translateY(calc(100%+1rem))] motion-reduce:transition-none md:h-(--console-height) md:max-h-none md:rounded-t-[50%_2.5rem] md:border-t-12"
      >
        <DashboardLip />
        <DashboardPlates />
        {/* Desktop: Floki on the left, the terminal in the middle, the radar over the radio on
            the right. Phones: Floki beside the radar and the radio, the terminal under them. */}
        <div className="mx-auto grid max-w-[96rem] grid-cols-[8.5rem_minmax(0,1fr)] gap-2.5 px-3 pt-5 pb-4 md:h-full md:grid-cols-[minmax(0,1fr)_minmax(0,40rem)_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)] md:gap-x-6 md:gap-y-3 md:px-8 md:pt-9 md:pb-6">
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
              praiseCount={praiseCount}
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
            footer={<PedestalKeys />}
            indicator={<ConsoleLights />}
            className="col-span-2 h-[min(20rem,36dvh)] md:col-span-1 md:col-start-2 md:row-span-2 md:row-start-1 md:h-auto"
            screenClassName="flex flex-col"
          >
            <CockpitTerminal
              terminal={terminal}
              isLocked={isLocked}
              shouldFocus={!isGreeting}
              onAsk={(question) => void flokiTalk.ask(question)}
              onGo={handleGo}
              onEgg={handleEgg}
              onJump={handleJump}
            />
          </ConsoleScreen>
        </div>
      </div>
    </div>
  );
}
