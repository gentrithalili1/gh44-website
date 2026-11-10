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
  DashboardLip,
  DashboardPlates,
  PedestalKeys,
  CockpitWindshield,
  ConsoleLights,
  ConsoleScreen,
} from "./CockpitWindow.elements";
import { CockpitFloki } from "./components/CockpitFloki";
import { CockpitStatus } from "./components/CockpitStatus";
import { SpacewalkDoor } from "./components/SpacewalkDoor";
import { Tesseract } from "./components/Tesseract";
import { CockpitRadar } from "./components/CockpitRadar";
import { CockpitRadio } from "./components/CockpitRadio";
import { CockpitTerminal, type TerminalEgg } from "./components/CockpitTerminal";
import { useFloki } from "./hooks/useFloki";
import { useFlokiTalk } from "./hooks/useFlokiTalk";
import { useFlokiWelcome } from "./hooks/useFlokiWelcome";
import { useIsWideScreen } from "./hooks/useIsWideScreen";
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
  // The hatch is on the cockpit wall on a wide screen, and in the dock on a phone.
  const isWideScreen = useIsWideScreen();
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

  // On every launch and jump the console slides away first, so the flight shows through the
  // whole windshield. Otherwise a phone visitor can dock it, down to its status strip.
  const panelPosition = isLocked ? "away" : panel === "hidden" ? "docked" : "shown";
  const isDocked = panelPosition === "docked";
  const isPanelAway = panelPosition === "away";

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
      {/* The hatch on the cockpit wall, on the right-hand pillar beside the side window; it moves
          with the windshield as the visitor looks around. On a phone it is in the dock. */}
      {isWideScreen ? (
        <div className="absolute top-[37%] left-[79%] [translate:calc(-50%+var(--look-x,0)*-8px)_calc(var(--look-y,0)*-5px)] transition-[translate,opacity] duration-500 ease-space group-data-[power=off]/cockpit:opacity-0 motion-reduce:[translate:-50%_0]">
          <SpacewalkDoor variant="hatch" isLocked={isLocked} onSpacewalk={handleClose} />
        </div>
      ) : null}
      {/* Slides out of the way (its own `transform`, apart from the boarding's `translate`). */}
      <div
        id={panelId}
        data-panel={panelPosition}
        inert={isPanelAway}
        aria-hidden={isPanelAway ? true : undefined}
        className="absolute inset-x-0 bottom-0 max-h-[86%] rounded-t-[50%_1.5rem] border-t-8 border-surface bg-bg-subtle bg-[linear-gradient(to_bottom,var(--surface),var(--bg-subtle)_30%)] shadow-[0_-1px_0_var(--rule),0_-18px_40px_-12px_rgb(0_0_0/0.8)] transition-transform duration-500 ease-space group-data-[power=off]/cockpit:animate-console-out group-data-[reveal=flight]/cockpit:animate-console-in max-md:data-[panel=away]:[transform:translateY(calc(100%-7.5rem))] max-md:data-[panel=docked]:[transform:translateY(calc(100%-7.5rem))] md:data-[panel=away]:[transform:translateY(calc(100%+1rem))] motion-reduce:transition-none md:h-(--console-height) md:max-h-none md:rounded-t-[50%_2.5rem] md:border-t-12"
      >
        <DashboardLip />
        <DashboardPlates />
        {/* Desktop: Floki on the left, the terminal in the middle, the radar over the radio on
            the right, the status strip over the terminal. Phones: the status strip on top (the
            dock), then Floki beside the radar and the radio, the terminal under them. */}
        <div className="mx-auto grid max-w-[96rem] grid-cols-[8.5rem_minmax(0,1fr)] gap-2.5 px-3 pt-5 pb-4 md:h-full md:grid-cols-[minmax(0,1fr)_minmax(0,40rem)_minmax(0,1fr)] md:grid-rows-[auto_auto_minmax(0,1fr)] md:gap-x-6 md:gap-y-3 md:px-8 md:pt-9 md:pb-6">
          <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1">
            <CockpitStatus
              titleId={titleId}
              hasSignal={hasSignal}
              earthYearsPassed={earthYearsPassed}
              // Docked by the visitor, or for a launch on a phone: the strip is all that shows.
              isDocked={isDocked || isPanelAway}
              panelId={panelId}
              isLocked={isLocked}
              onPanelToggle={handlePanelToggle}
              onSpacewalk={handleClose}
              hasDoor={!isWideScreen}
            />
          </div>
          {/* Docked, the rest of the panel is below the screen's edge: out of reach. */}
          <div inert={isDocked} aria-hidden={isDocked ? true : undefined} className="contents">
            <ConsoleScreen
              label={messages.screens.floki}
              powerOrder={0}
              className="row-span-2 md:col-start-1 md:row-span-3 md:row-start-1"
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
              className="md:col-start-3 md:row-span-2 md:row-start-1"
              screenClassName="p-2 md:p-3"
            >
              <CockpitRadar />
            </ConsoleScreen>
            <ConsoleScreen
              label={messages.screens.radio}
              powerOrder={3}
              className="md:col-start-3 md:row-start-3"
              screenClassName="flex flex-col p-2 md:p-3"
            >
              <CockpitRadio />
            </ConsoleScreen>
            <ConsoleScreen
              label={messages.screens.terminal}
              powerOrder={1}
              footer={<PedestalKeys />}
              indicator={<ConsoleLights />}
              className="col-span-2 h-[min(20rem,36dvh)] md:col-span-1 md:col-start-2 md:row-span-2 md:row-start-2 md:h-auto"
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
    </div>
  );
}
