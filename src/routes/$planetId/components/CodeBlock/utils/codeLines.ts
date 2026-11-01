import type { CodeLine } from "../../../types";

// Ids are character offsets into the code, line breaks included: stable for the same code.
type RevealedToken = {
  id: string;
  content: string;
  color: string | undefined;
  isRevealed: boolean;
};

export type RevealedLine = { id: string; tokens: RevealedToken[] };

const MS_PER_CHARACTER = 14;
// Long code still types in this long.
const MAX_TYPING_MS = 1200;

export function getTypingDuration(length: number) {
  return Math.min(MAX_TYPING_MS, length * MS_PER_CHARACTER);
}

// Plain lines for code the server did not highlight.
export function getPlainLines(code: string): CodeLine[] {
  return code.split("\n").map((line) => [{ content: line, color: undefined }]);
}

// Every character, line breaks included.
export function getCodeLength(lines: CodeLine[]) {
  const characters = lines.flat().reduce((length, token) => length + token.content.length, 0);

  return characters + Math.max(0, lines.length - 1);
}

type RevealLinesParams = {
  lines: CodeLine[];
  revealedLength: number;
};

// Splits the code where the typing has reached: the first `revealedLength` characters show, the
// rest keeps its place, hidden.
export function revealLines({ lines, revealedLength }: RevealLinesParams): RevealedLine[] {
  let offset = 0;

  return lines.map((line) => {
    const lineId = String(offset);
    const tokens = line.flatMap((token) => {
      const start = offset;
      offset += token.content.length;
      const shown = Math.max(0, Math.min(revealedLength - start, token.content.length));
      const piece = { id: String(start), color: token.color };
      if (shown === token.content.length) {
        return [{ ...piece, content: token.content, isRevealed: true }];
      }
      if (shown === 0) return [{ ...piece, content: token.content, isRevealed: false }];

      return [
        { ...piece, content: token.content.slice(0, shown), isRevealed: true },
        {
          id: String(start + shown),
          color: token.color,
          content: token.content.slice(shown),
          isRevealed: false,
        },
      ];
    });

    offset += 1;

    return { id: lineId, tokens };
  });
}
