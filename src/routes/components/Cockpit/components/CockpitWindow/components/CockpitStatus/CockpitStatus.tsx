import { PanelIcon } from "../../CockpitWindow.elements";
import { EarthClock } from "../EarthClock";
import { SpacewalkDoor } from "../SpacewalkDoor";
import { messages } from "./messages";

const CARD =
  "flex items-center rounded-lg bg-black/25 shadow-[inset_0_1px_3px_rgb(0_0_0/0.6),0_1px_0_rgb(255_255_255/0.04)]";

interface CockpitStatusProps {
  // Labels the cockpit dialog: the ship's name, for screen readers.
  titleId: string;
  // Every planet visited, and the black hole still ahead: the clock's card says so.
  hasSignal: boolean;
  earthYearsPassed: number;
  // On a phone the panel can fold down to this strip, the dock.
  canDock: boolean;
  isDocked: boolean;
  panelId: string;
  // After `go`: nothing to press.
  isLocked: boolean;
  onPanelToggle: () => void;
  onSpacewalk: () => void;
}

// The strip on top of the dashboard, in cards: Earth's date and time, the exit out on a
// spacewalk and, on a phone, the one that folds the panel down to this strip and back.
export function CockpitStatus({
  titleId,
  hasSignal,
  earthYearsPassed,
  canDock,
  isDocked,
  panelId,
  isLocked,
  onPanelToggle,
  onSpacewalk,
}: CockpitStatusProps) {
  return (
    // Docked on a phone it sits at the bottom of the screen, high enough that the site's music
    // button in the corner stays under it: the strip keeps the whole width.
    <div data-docked={isDocked ? "" : undefined} className="flex min-w-0 items-stretch gap-2">
      <h2 id={titleId} className="sr-only">
        {messages.title}
      </h2>
      <div
        data-signal={hasSignal ? "" : undefined}
        className={`${CARD} min-w-0 flex-1 gap-2 overflow-hidden px-3 py-1.5`}
      >
        {hasSignal ? (
          <p className="flex items-center gap-2 text-xs whitespace-nowrap text-ochre">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 animate-light-blink rounded-full bg-ochre shadow-[0_0_6px_var(--ochre)]"
            />
            {messages.statusSignal}
          </p>
        ) : null}
        <EarthClock yearsPassed={earthYearsPassed} />
      </div>
      {canDock ? (
        <button
          type="button"
          aria-label={isDocked ? messages.panelShow : messages.panelHide}
          aria-expanded={!isDocked}
          aria-controls={panelId}
          disabled={isLocked}
          onClick={onPanelToggle}
          className={`${CARD} w-14 shrink-0 justify-center text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40`}
        >
          <PanelIcon direction={isDocked ? "up" : "down"} />
        </button>
      ) : null}
      <SpacewalkDoor isLocked={isLocked} onSpacewalk={onSpacewalk} />
    </div>
  );
}
