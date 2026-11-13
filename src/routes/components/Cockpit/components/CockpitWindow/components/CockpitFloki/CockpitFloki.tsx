import { lazy, Suspense } from "react";

import { useSpaceMode } from "#/hooks/useSpaceMode";

import type { FlokiStatus } from "../../hooks/useFloki";
import { FlokiHead, MicIcon } from "./CockpitFloki.elements";
import { FlokiSignal } from "./components/FlokiSignal";
import { messages } from "./messages";

// Loaded only with the 3D scene: three.js stays out of the static page.
const FlokiPortrait = lazy(() =>
  import("./components/FlokiPortrait").then((module) => ({ default: module.FlokiPortrait })),
);

interface CockpitFlokiProps {
  status: FlokiStatus;
  // How loud the mic or Floki's voice is right now, from 0 to 1.
  getLevel: () => number;
  // The browser can hear the visitor; without it they type `floki <question>`.
  canListen: boolean;
  // Talk was tapped and Floki keeps listening after each answer until it ends.
  isConversing: boolean;
  isLocked: boolean;
  // How many times he has been called a good boy: his ears perk up each time.
  praiseCount: number;
  onTalk: () => void;
}

export function CockpitFloki({
  status,
  getLevel,
  canListen,
  isConversing,
  isLocked,
  praiseCount,
  onTalk,
}: CockpitFlokiProps) {
  const isActive = isConversing || status === "listening" || status === "speaking";
  const spaceMode = useSpaceMode();
  const drawnHead = (
    <FlokiHead
      status={status}
      praiseCount={praiseCount}
      grille={<FlokiSignal status={status} getLevel={getLevel} />}
    />
  );

  return (
    <section
      aria-label={messages.label}
      className="flex min-h-0 flex-1 flex-col justify-between gap-2 md:justify-start md:gap-3"
    >
      <div aria-hidden="true" className="shrink-0 md:flex md:min-h-0 md:flex-1 md:justify-center">
        {spaceMode === "scene" ? (
          <span data-status={status} className="relative block aspect-square h-full max-w-full">
            <Suspense fallback={drawnHead}>
              <FlokiPortrait status={status} getLevel={getLevel} praiseCount={praiseCount} />
            </Suspense>
          </span>
        ) : (
          drawnHead
        )}
      </div>
      <div className="flex min-w-0 flex-col md:flex-row md:items-end md:gap-3">
        <div className="min-w-0 md:flex-1">
          <p className="sr-only text-xs md:not-sr-only md:flex md:flex-col">
            <span className="text-lavender">{messages.name}</span>
            <span role="status" className="truncate text-muted">
              {messages.status[status]}
            </span>
          </p>
          <p className="hidden text-[0.625rem] leading-snug text-faint md:[@media(min-height:50rem)]:mt-1 md:[@media(min-height:50rem)]:line-clamp-2">
            {canListen ? messages.privacy : messages.typeInstead}
          </p>
        </div>
        {canListen ? (
          <button
            type="button"
            aria-label={isActive ? messages.stopLabel : messages.talkLabel}
            aria-pressed={isConversing}
            disabled={isLocked}
            onClick={onTalk}
            data-floki-talk
            className="flex h-8 items-center justify-center gap-1.5 self-stretch rounded-full border border-lavender/35 bg-lavender/8 px-2 text-[0.6875rem] whitespace-nowrap text-lavender transition-colors hover:border-lavender/70 hover:bg-lavender/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender disabled:opacity-40 aria-pressed:border-lavender aria-pressed:bg-lavender/20 md:shrink-0 md:self-end md:px-3 md:pl-2.5 md:text-xs"
          >
            <MicIcon />
            {isActive ? messages.stop : messages.talk}
          </button>
        ) : null}
      </div>
    </section>
  );
}
