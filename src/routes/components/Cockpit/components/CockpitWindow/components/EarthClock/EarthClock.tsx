import { useNow } from "./hooks/useNow";
import { messages } from "./messages";
import { getEarthDate } from "./utils/earthTime";

// In the visitor's own locale and time zone.
const earthFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "medium",
});

interface EarthClockProps {
  // The years that passed on Earth while the ship was in the black hole.
  yearsPassed: number;
}

// The date and time on Earth, ticking in the cockpit's header. Back from the black hole it
// runs years ahead, and shows it.
export function EarthClock({ yearsPassed }: EarthClockProps) {
  const now = useNow();
  if (now === null) return null;
  const time = earthFormat.format(getEarthDate({ now, yearsPassed })).toLowerCase();

  return (
    <p className="flex gap-2 text-xs text-faint tabular-nums">
      <span aria-hidden="true">{messages.label}</span>
      <time
        // Screen readers get the time when they ask, not every second.
        aria-label={messages.timeLabel(time)}
        data-ahead={yearsPassed > 0 ? "" : undefined}
        className="transition-colors duration-700 data-ahead:text-ochre"
      >
        {time}
      </time>
    </p>
  );
}
