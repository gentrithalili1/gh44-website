// One line playing: it settles when the line ends (or stop cuts it off), or at once when the
// browser blocks sound until the visitor clicks or presses a key.
export type Playback = { done: Promise<"ended" | "blocked">; stop: () => void };

// Plays a line's audio somewhere other than a plain audio element, or gives undefined to fall
// back to one.
export type PlayVoice = (audioUrl: string) => Promise<Playback | undefined>;
