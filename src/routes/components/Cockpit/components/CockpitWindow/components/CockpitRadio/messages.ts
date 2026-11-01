export const messages = {
  label: "radio",
  offline: "radio offline",
  tuning: "tuning…",
  playLabel: ({ title, artist }: { title: string; artist: string }) => `play ${title} by ${artist}`,
  // Between the artist and the title.
  trackSeparator: " - ",
  stopLabel: "stop the radio",
  previousLabel: "previous track",
  nextLabel: "next track",
} as const;
