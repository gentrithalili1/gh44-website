import { DoorIcon } from "./SpacewalkDoor.elements";
import { messages } from "./messages";

interface SpacewalkDoorProps {
  // After `go`: the hatch stays shut.
  isLocked: boolean;
  onSpacewalk: () => void;
}

export function SpacewalkDoor({ isLocked, onSpacewalk }: SpacewalkDoorProps) {
  return (
    // The whole card is the exit, in rose like a hatch's warning light.
    <button
      type="button"
      aria-label={messages.spacewalkLabel}
      disabled={isLocked}
      onClick={onSpacewalk}
      className="group/door flex w-14 shrink-0 items-center justify-center gap-2 rounded-lg md:w-auto md:justify-start border border-rose/35 bg-rose/12 px-3 py-1.5 text-xs text-rose shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-colors hover:border-rose/70 hover:bg-rose/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:opacity-40 md:pr-4"
    >
      <span className="block h-5 transition-transform duration-300 ease-space group-hover/door:scale-110 group-disabled/door:scale-100">
        <DoorIcon />
      </span>
      <span aria-hidden="true" className="max-md:hidden">
        {messages.spacewalk}
      </span>
    </button>
  );
}
