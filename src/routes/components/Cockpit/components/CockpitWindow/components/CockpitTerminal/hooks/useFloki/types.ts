import type { PlanetId } from "#/utils/planets";

// One message in a conversation with Floki.
export type FlokiTurn = { role: "visitor" | "floki"; text: string };

// What Floki answers: words to say, and a planet to fly to when the visitor asked to go.
export type FlokiReply = { say: string; go: PlanetId | undefined };

export type AskFlokiInput = { turns: readonly FlokiTurn[]; humor: number };

export type AskFlokiOutcome =
  | { status: "answered"; reply: FlokiReply }
  | { status: "failed"; reason: "rateLimited" | "unavailable" };

export type SpeakFlokiOutcome =
  // A WAV data URL, ready for an audio element.
  | { status: "spoken"; audioUrl: string }
  | { status: "failed"; reason: "rateLimited" | "unavailable" };
