import type { FlokiStatus } from "../../hooks/useFloki";
import { FlokiSignal } from "./components/FlokiSignal";
import { MicIcon } from "./TerminalFloki.elements";
import { messages } from "./messages";

interface TerminalFlokiProps {
  status: FlokiStatus;
  // The browser can hear the visitor; without it they type `floki <question>`.
  canListen: boolean;
  isLocked: boolean;
  // Talk was tapped and Floki keeps listening after each answer until it ends.
  isConversing: boolean;
  // How loud the mic or Floki's voice is right now, from 0 to 1.
  getLevel: () => number;
  onTalk: () => void;
}

// Floki at the top of the terminal: his signal, what he is doing, and the button to talk to him.
// The mic only opens on that button.
export function TerminalFloki({
  status,
  canListen,
  isLocked,
  isConversing,
  getLevel,
  onTalk,
}: TerminalFlokiProps) {
  const isActive = isConversing || status === "listening" || status === "speaking";

  return (
    <section
      aria-label={messages.label}
      className="flex shrink-0 items-center gap-3 border-b border-border-subtle px-3 py-2 md:px-4"
    >
      <FlokiSignal status={status} getLevel={getLevel} />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="flex items-baseline gap-2 text-xs">
          <span className="text-lavender">{messages.name}</span>
          <span role="status" className="truncate text-muted">
            {messages.status[status]}
          </span>
        </p>
        <p className="truncate text-[0.6875rem] text-faint">
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
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-rule bg-bg-subtle pr-3 pl-2.5 text-xs text-muted transition-colors hover:border-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40 aria-pressed:border-lavender aria-pressed:text-lavender"
        >
          <MicIcon />
          {isActive ? messages.stop : messages.talk}
        </button>
      ) : null}
    </section>
  );
}
