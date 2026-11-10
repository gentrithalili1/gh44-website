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
  playlistLabel: "playlist",
  // Past the last track: nothing on air, then a signal for whoever stays.
  deadAir: "dead air",
  morseLabel: (text: string) => `a signal in morse: ${text}`,
} as const;
