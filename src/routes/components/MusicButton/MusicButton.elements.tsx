const PLAY_ICON = "M4 2.5v11l9-5.5z";
const STOP_ICON = "M4 4h8v8H4z";
const BAR_IDS = ["low", "mid", "high"] as const;

interface MusicIconProps {
  isPlaying: boolean;
}

export function MusicIcon({ isPlaying }: MusicIconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4.5">
      <path d={isPlaying ? STOP_ICON : PLAY_ICON} className="fill-current" />
    </svg>
  );
}

// Three bars that bounce while the track plays.
export function MusicBars() {
  return (
    <span aria-hidden="true" className="flex h-4 items-end gap-0.75">
      {BAR_IDS.map((id) => (
        <i
          key={id}
          className="h-1 w-0.75 animate-music-bar rounded-full bg-current [&:nth-child(2)]:[animation-delay:-300ms] [&:nth-child(3)]:[animation-delay:-600ms]"
        />
      ))}
    </span>
  );
}
