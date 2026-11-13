import { DESTINATIONS, type Destination } from "#/utils/destinations";

export type LineSegment =
  | { kind: "text"; text: string }
  | { kind: "destination"; destination: Destination; start: number };

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
