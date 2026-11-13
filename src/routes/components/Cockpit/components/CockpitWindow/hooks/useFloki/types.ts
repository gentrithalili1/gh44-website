import type { PlanetId } from "#/utils/planets";

// One message in a conversation with Floki.
export type FlokiTurn = { role: "visitor" | "floki"; text: string };

// Where Floki and the visitor are: aboard the ship, or inside the black hole.
export type FlokiPlace = "cockpit" | "tesseract";

export type FlokiReply = {
  say: string;
  go: PlanetId | undefined;
  gargantua: boolean;
  back: boolean;
};

export type AskFlokiInput = { turns: readonly FlokiTurn[]; humor: number; place: FlokiPlace };

export type AskFlokiOutcome =
  | { status: "answered"; reply: FlokiReply }
  | { status: "failed"; reason: "rateLimited" | "unavailable" };

export type SpeakFlokiOutcome =
  // A WAV data URL, ready for an audio element.
  | { status: "spoken"; audioUrl: string }
  | { status: "failed"; reason: "rateLimited" | "unavailable" };
