import { DoorIcon } from "./SpacewalkDoor.elements";
import { messages } from "./messages";

interface SpacewalkDoorProps {
  // A hatch on the cockpit wall with its name under it, or a round button in the status strip.
  variant: "hatch" | "compact";
  // After `go`: the hatch stays shut.
  isLocked: boolean;
  onSpacewalk: () => void;
}

// The way out on a spacewalk: the cockpit's hatch.
export function SpacewalkDoor({ variant, isLocked, onSpacewalk }: SpacewalkDoorProps) {
  if (variant === "compact") {
    return (
      <button
        type="button"
        aria-label={messages.spacewalkLabel}
        disabled={isLocked}
        onClick={onSpacewalk}
        className="flex size-9 items-center justify-center rounded-full border border-rule bg-bg-subtle py-1.5 transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40"
      >
        <DoorIcon />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={messages.spacewalkLabel}
      disabled={isLocked}
      onClick={onSpacewalk}
      className="group/door flex flex-col items-center gap-1.5 rounded-lg p-1.5 text-[0.625rem] tracking-kicker text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40"
    >
      <span className="block h-16 drop-shadow-[0_4px_10px_rgb(0_0_0/0.7)] transition-transform duration-300 ease-space group-hover/door:scale-105 group-disabled/door:scale-100">
        <DoorIcon />
      </span>
      <span aria-hidden="true">{messages.spacewalk}</span>
    </button>
  );
}
