type TrackCopy = { title: string; artist: string };

export const messages = {
  playLabel: ({ title, artist }: TrackCopy) => `play ${title} by ${artist}`,
  playTitle: ({ title }: TrackCopy) => `play ${title}`,
  stopLabel: "stop the music",
  stopTitle: "stop",
} as const;
