// One line playing: it settles when the line ends, and stop cuts it off.
export type Playback = { done: Promise<void>; stop: () => void };

// Plays a line's audio somewhere other than a plain audio element, or gives undefined to fall
// back to one.
export type PlayVoice = (audioUrl: string) => Promise<Playback | undefined>;
