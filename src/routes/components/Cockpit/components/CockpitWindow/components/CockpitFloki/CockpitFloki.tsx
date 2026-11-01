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
// On phones it shrinks to his head and the button.
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
      className="flex flex-col gap-1.5 md:h-full md:min-h-0 md:flex-row md:items-center md:gap-3"
    >
      <div aria-hidden="true" className="shrink-0 md:flex md:h-full md:justify-center">
        <FlokiHead status={status} grille={<FlokiSignal status={status} getLevel={getLevel} />} />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5 md:flex-1">
        <p className="sr-only text-xs md:not-sr-only md:flex md:flex-col">
          <span className="text-lavender">{messages.name}</span>
          <span role="status" className="truncate text-muted">
            {messages.status[status]}
          </span>
        </p>
        <p className="hidden text-[0.625rem] leading-snug text-faint md:line-clamp-2">
          {canListen ? messages.privacy : messages.typeInstead}
        </p>
        {canListen ? (
          <button
            type="button"
            aria-label={isActive ? messages.stopLabel : messages.talkLabel}
            aria-pressed={isConversing}
            disabled={isLocked}
            onClick={onTalk}
            data-floki-talk
            className="flex h-8 items-center justify-center gap-1.5 self-stretch rounded-full border border-rule bg-bg-subtle px-3 text-xs text-muted transition-colors hover:border-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40 aria-pressed:border-lavender aria-pressed:text-lavender md:self-start md:pl-2.5"
          >
            <MicIcon />
            {isActive ? messages.stop : messages.talk}
          </button>
        ) : null}
      </div>
    </section>
  );
}
