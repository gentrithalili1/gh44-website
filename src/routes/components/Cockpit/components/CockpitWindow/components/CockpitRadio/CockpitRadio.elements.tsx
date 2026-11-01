const ICON_PATHS = {
  play: "M5 3v10l8-5z",
  stop: "M4.5 4.5h7v7h-7z",
  previous: "M4 3.5v9M12.5 3.5 6 8l6.5 4.5z",
  next: "M12 3.5v9M3.5 3.5 10 8l-6.5 4.5z",
  playlist: "M3 4.5h10M3 8h10M3 11.5h6",
} as const;

const LEVEL_BAR_IDS = ["a", "b", "c", "d", "e"] as const;

interface RadioIconProps {
  name: keyof typeof ICON_PATHS;
}

export function RadioIcon({ name }: RadioIconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
      <path
        d={ICON_PATHS[name]}
        className="fill-current stroke-current stroke-[1.5] [stroke-linejoin:round]"
      />
    </svg>
  );
}

interface RadioLevelProps {
  isPlaying: boolean;
}

// A small level meter: bounces while the radio plays, flat while it is quiet.
export function RadioLevel({ isPlaying }: RadioLevelProps) {
  return (
    <span aria-hidden="true" className="flex h-3 items-end gap-0.5">
      {LEVEL_BAR_IDS.map((id) => (
        <i
          key={id}
          data-playing={isPlaying}
          className="h-0.5 w-0.75 rounded-full bg-sage data-[playing=false]:bg-fg-faint data-[playing=true]:animate-radio-level [&:nth-child(2)]:[animation-delay:-450ms] [&:nth-child(3)]:[animation-delay:-200ms] [&:nth-child(4)]:[animation-delay:-700ms] [&:nth-child(5)]:[animation-delay:-950ms]"
        />
      ))}
    </span>
  );
}

interface RadioButtonProps extends React.ComponentProps<"button"> {
  children: React.ReactNode;
}

export function RadioButton({ children, ...props }: RadioButtonProps) {
  return (
    <button
      type="button"
      data-music-control=""
      className="flex size-8 items-center justify-center rounded-full border border-border-subtle text-muted transition-colors hover:border-rule hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-35"
      {...props}
    >
      {children}
    </button>
  );
}

interface RadioTrackProps {
  isPlaying: boolean;
  artist: string;
  separator: string;
  title: string;
}

// Now playing: the artist, then the title; on phones the level meter leads the line, on desktop
// it sits in the radio's header.
export function RadioTrack({ isPlaying, artist, separator, title }: RadioTrackProps) {
  return (
    <p role="status" className="flex min-w-0 items-baseline gap-2 text-xs md:justify-center">
      <span className="md:hidden">
        <RadioLevel isPlaying={isPlaying} />
      </span>
      {/* One truncated line on phones; on desktop the whole name shows, wrapping if needed. */}
      <span className="min-w-0 truncate md:overflow-visible md:text-clip md:whitespace-normal">
        <span className="text-muted">
          {artist}
          {separator}
        </span>
        <span className="text-foreground">{title}</span>
      </span>
    </p>
  );
}

interface PlaylistTrackProps {
  isCurrent: boolean;
  isPlaying: boolean;
  artist: string;
  separator: string;
  title: string;
  onClick: () => void;
}

// One row of the playlist: the current track stands out, its level meter bouncing while it plays.
export function PlaylistTrack({
  isCurrent,
  isPlaying,
  artist,
  separator,
  title,
  onClick,
}: PlaylistTrackProps) {
  return (
    <li>
      <button
        type="button"
        data-music-control=""
        aria-current={isCurrent ? "true" : undefined}
        onClick={onClick}
        className="flex w-full items-center justify-between gap-2 rounded-sm px-1.5 py-0.5 text-left text-xs text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground aria-[current=true]:text-foreground"
      >
        <span className="min-w-0 truncate">
          {artist}
          {separator}
          {title}
        </span>
        {isCurrent ? <RadioLevel isPlaying={isPlaying} /> : null}
      </button>
    </li>
  );
}
