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

export type FlokiCommand =
  | { kind: "go"; destination: Destination }
  | { kind: "humor"; humor: number };

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

// A plain order Floki carries out without thinking: fly to one clear destination, or change his
// humor setting. Anything else is a question for the model.
export function getFlokiCommand(text: string): FlokiCommand | undefined {
  const normalized = normalize(text);
  const humor = HUMOR_PATTERN.exec(normalized)?.[1];
  if (humor !== undefined) return { kind: "humor", humor: Math.min(Number(humor), MAX_HUMOR) };

  const target = NAVIGATE_PATTERN.exec(normalized)?.[1];
  if (target === undefined) return undefined;
  const matches = DESTINATIONS.filter((destination) =>
    getNames(destination).some((word) => hasWord({ text: target, word })),
  );
  const [destination] = matches;

  return matches.length === 1 && destination ? { kind: "go", destination } : undefined;
}
