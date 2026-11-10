import { PanelIcon } from "../../CockpitWindow.elements";
import { EarthClock } from "../EarthClock";
import { SpacewalkDoor } from "../SpacewalkDoor";
import { messages } from "./messages";

interface CockpitStatusProps {
  // Labels the cockpit dialog.
  titleId: string;
  // Every planet visited, and the black hole still ahead.
  hasSignal: boolean;
  earthYearsPassed: number;
  // On a phone the panel can be docked: just this strip stays up.
  isDocked: boolean;
  panelId: string;
  // After `go`: nothing to press.
  isLocked: boolean;
  onPanelToggle: () => void;
  onSpacewalk: () => void;
  // On a phone the hatch is here, in the dock; on a wide screen it is on the cockpit wall.
  hasDoor: boolean;
}

// The strip on top of the dashboard: the ship's name, its status and Earth's clock. On a phone
// it is also the dock, with the hatch out on a spacewalk and the button that folds the panel
// down to this strip and back.
export function CockpitStatus({
  titleId,
  hasSignal,
  earthYearsPassed,
  isDocked,
  panelId,
  isLocked,
  onPanelToggle,
  onSpacewalk,
  hasDoor,
}: CockpitStatusProps) {
  return (
    // Docked on a phone it sits at the bottom of the screen: its buttons stay clear of the site's
    // music button in the corner.
    <div
      data-docked={isDocked ? "" : undefined}
      className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-black/25 px-3 py-2 shadow-[inset_0_1px_3px_rgb(0_0_0/0.6),0_1px_0_rgb(255_255_255/0.04)] transition-[margin] duration-500 ease-space max-md:data-docked:mr-16 md:px-4"
    >
      <div className="flex min-w-0 flex-col gap-0.5 md:flex-row md:items-baseline md:gap-4">
        <h2 id={titleId} className="text-label font-bold whitespace-nowrap tracking-label">
          {messages.title}
        </h2>
        <p
          data-signal={hasSignal ? "" : undefined}
          className="flex items-center gap-2 text-xs whitespace-nowrap text-muted data-signal:text-ochre"
        >
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 animate-light-blink rounded-full bg-sage in-data-signal:bg-ochre in-data-signal:shadow-[0_0_6px_var(--ochre)]"
          />
          {hasSignal ? messages.statusSignal : messages.status}
        </p>
        <EarthClock yearsPassed={earthYearsPassed} />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {/* Only phones fold the panel away: on a wide screen the view is already open. */}
        <button
          type="button"
          aria-label={isDocked ? messages.panelShow : messages.panelHide}
          aria-expanded={!isDocked}
          aria-controls={panelId}
          disabled={isLocked}
          onClick={onPanelToggle}
          className="flex size-9 items-center justify-center rounded-full border border-rule bg-bg-subtle text-muted transition-colors hover:border-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40 md:hidden"
        >
          <PanelIcon direction={isDocked ? "up" : "down"} />
        </button>
        {hasDoor ? (
          <SpacewalkDoor variant="compact" isLocked={isLocked} onSpacewalk={onSpacewalk} />
        ) : null}
      </div>
    </div>
  );
}
