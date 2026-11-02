import type { Track } from "#/routes/hooks/useMusic/utils/tracks";
import { DESTINATIONS, type Destination } from "#/utils/destinations";
import type { PlanetId } from "#/utils/planets";

// Words a visitor may use for each destination, besides its name: the real planet, and what it
// holds.
const DESTINATION_ALIASES = {
  me: ["earth", "contact", "home planet"],
  "gh44-confirm": ["mars", "confirm", "dialog", "dialogs"],
  work: ["jupiter", "jobs", "job", "experience", "career", "companies"],
  "gh44-theme": ["saturn", "theme", "themes", "colors", "colours", "palette"],
  "gh44-brain": ["neptune", "brain", "claude", "agents"],
} as const satisfies Record<PlanetId, readonly string[]>;

// "take me to", "fly to", "go back to", "show me", ... then where.
const NAVIGATE_PATTERN =
  /^(?:please |floki )*(?:take me|bring me|fly|go|head|navigate|show me|open)(?: me)?(?: back)?(?: over)?(?: to)?(?: the| your| his)? (.+)$/;
const HUMOR_PATTERN =
  /^(?:floki )?(?:set )?(?:your )?humou?r(?: setting)?(?: to| at)? (\d{1,3})(?: ?%| percent)?$/;
const MAX_HUMOR = 100;
// The radio: "play", "stop the music", "next song", "previous track", ... or "play <track>".
const PLAY_PATTERN =
  /^(?:please |floki )*(?:play|start|resume|unpause|turn on|put on)(?: the| some| your)?(?: music| radio| tunes)?(?: please)?$/;
const STOP_PATTERN =
  /^(?:please |floki )*(?:(?:stop|pause|mute|turn off|kill)(?: the| this| that)? (?:music|radio|song|track|tunes)|pause|mute|turn off)(?: please)?$/;
const NEXT_PATTERN =
  /^(?:please |floki )*(?:next|skip)(?: the| this| that)?(?: song| track| one)?(?: please)?$/;
const PREVIOUS_PATTERN =
  /^(?:please |floki )*(?:previous(?: song| track| one)?|(?:last|go back a|back a) (?:song|track))(?: please)?$/;
const TRACK_PATTERN = /^(?:please |floki )*(?:play|put on)(?: me| us)? (.+?)(?: on the radio)?$/;

export type FlokiMusicAction = "play" | "stop" | "next" | "previous";

export type FlokiCommand =
  | { kind: "go"; destination: Destination }
  | { kind: "humor"; humor: number }
  | { kind: "music"; action: FlokiMusicAction }
  | { kind: "track"; trackIndex: number };

type GetFlokiCommandParams = { text: string; tracks: readonly Track[] };

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9%\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getNames(destination: Destination) {
  return [
    destination.name,
    destination.name.replace("-", " "),
    ...DESTINATION_ALIASES[destination.name],
  ];
}

function hasWord({ text, word }: { text: string; word: string }) {
  return ` ${text} `.includes(` ${word} `);
}

function getMusicAction(text: string): FlokiMusicAction | undefined {
  if (PLAY_PATTERN.test(text)) return "play";
  if (STOP_PATTERN.test(text)) return "stop";
  if (NEXT_PATTERN.test(text)) return "next";
  if (PREVIOUS_PATTERN.test(text)) return "previous";
  return undefined;
}

// The one track a "play <track>" names, by its title or id.
function getTrackIndex({ text, tracks }: GetFlokiCommandParams) {
  const target = TRACK_PATTERN.exec(text)?.[1];
  if (target === undefined) return undefined;
  const matches = tracks.flatMap((track, index) =>
    [normalize(track.title), track.id.replaceAll("-", " ")].some((word) =>
      hasWord({ text: target, word }),
    )
      ? [index]
      : [],
  );

  return matches.length === 1 ? matches[0] : undefined;
}

// A plain order Floki carries out without thinking: fly to one clear destination, change his
// humor setting, or work the radio. Anything else is a question for the model.
export function getFlokiCommand({ text, tracks }: GetFlokiCommandParams): FlokiCommand | undefined {
  const normalized = normalize(text);
  const humor = HUMOR_PATTERN.exec(normalized)?.[1];
  if (humor !== undefined) return { kind: "humor", humor: Math.min(Number(humor), MAX_HUMOR) };

  const action = getMusicAction(normalized);
  if (action) return { kind: "music", action };
  const trackIndex = getTrackIndex({ text: normalized, tracks });
  if (trackIndex !== undefined) return { kind: "track", trackIndex };

  const target = NAVIGATE_PATTERN.exec(normalized)?.[1];
  if (target === undefined) return undefined;
  const matches = DESTINATIONS.filter((destination) =>
    getNames(destination).some((word) => hasWord({ text: target, word })),
  );
  const [destination] = matches;

  return matches.length === 1 && destination ? { kind: "go", destination } : undefined;
}
