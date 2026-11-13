export type Playback = { done: Promise<"ended" | "blocked">; stop: () => void };

export type PlayVoice = (audioUrl: string) => Promise<Playback | undefined>;
