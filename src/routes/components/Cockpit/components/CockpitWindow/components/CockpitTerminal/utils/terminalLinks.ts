import { DESTINATIONS, type Destination } from "#/utils/destinations";

// A run of a printed line: plain text, or a destination's name, which links to it.
// A name's `start` (its index in the line) keys it.
export type LineSegment =
  | { kind: "text"; text: string }
  | { kind: "destination"; destination: Destination; start: number };

// A whole name between spaces, commas or the line's ends: never part of a word or a route.
// Longest first, so a name never matches the start of a longer one.
const NAME_PATTERN = new RegExp(
  `(?<=^|[\\s,])(${DESTINATIONS.map((destination) => destination.name)
    .sort((a, b) => b.length - a.length)
    .join("|")})(?=$|[\\s,])`,
  "g",
);

// Splits a printed line so every destination named in it can be clicked.
export function getLineSegments(text: string): LineSegment[] {
  const segments: LineSegment[] = [];
  let index = 0;
  for (const match of text.matchAll(NAME_PATTERN)) {
    const destination = DESTINATIONS.find((candidate) => candidate.name === match[0]);
    if (!destination) continue;
    if (match.index > index) segments.push({ kind: "text", text: text.slice(index, match.index) });
    segments.push({ kind: "destination", destination, start: match.index });
    index = match.index + match[0].length;
  }
  if (index < text.length) segments.push({ kind: "text", text: text.slice(index) });

  return segments;
}
