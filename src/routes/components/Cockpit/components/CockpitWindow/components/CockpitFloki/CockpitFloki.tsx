import type { FlokiStatus } from "../../hooks/useFloki";
import { FlokiHead, MicIcon } from "./CockpitFloki.elements";
import { FlokiSignal } from "./components/FlokiSignal";
import { messages } from "./messages";

interface CockpitFlokiProps {
  status: FlokiStatus;
  // How loud the mic or Floki's voice is right now, from 0 to 1.
  getLevel: () => number;
  // The browser can hear the visitor; without it they type `floki <question>`.
  canListen: boolean;
  // Talk was tapped and Floki keeps listening after each answer until it ends.
  isConversing: boolean;
  isLocked: boolean;
  onTalk: () => void;
}

// Floki's own screen: the ship's robotic German shepherd, his signal lighting the grille in his
// muzzle, what he is doing, and the button to talk to him. The mic only opens on that button.
// On desktop his head fills the screen above the status; on phones it shrinks to his head and
// the button.
export function CockpitFloki({
  status,
  getLevel,
  canListen,
  isConversing,
  isLocked,
  onTalk,
}: CockpitFlokiProps) {
  const isActive = isConversing || status === "listening" || status === "speaking";

  return (
    <section
      aria-label={messages.label}
      className="flex min-h-0 flex-1 flex-col justify-between gap-2 md:justify-start md:gap-3"
    >
      <div aria-hidden="true" className="shrink-0 md:flex md:min-h-0 md:flex-1 md:justify-center">
        <FlokiHead status={status} grille={<FlokiSignal status={status} getLevel={getLevel} />} />
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
