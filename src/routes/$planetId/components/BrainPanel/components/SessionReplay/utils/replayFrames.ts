// A line of the session: what Gentrit types, or what Claude answers.
export type ReplayLine = { id: string; kind: "prompt" | "reply"; text: string };

type ReplayFrameLine = ReplayLine & {
  // The part on screen so far; the rest keeps its place, hidden.
  shownText: string;
  hiddenText: string;
};

const PROMPT_PAUSE_MS = 500;
const TYPING_MS_PER_CHARACTER = 40;
const REPLY_PAUSE_MS = 700;

function getLineDuration(line: ReplayLine) {
  switch (line.kind) {
    case "prompt":
      return PROMPT_PAUSE_MS + line.text.length * TYPING_MS_PER_CHARACTER;
    case "reply":
      return REPLY_PAUSE_MS;
    default: {
      const unknownKind: never = line.kind;
      return unknownKind;
    }
  }
}

export function getReplayDuration(script: readonly ReplayLine[]) {
  return script.reduce((duration, line) => duration + getLineDuration(line), 0);
}

// How much of a line shows `elapsedMs` into it: prompts type in after a pause, replies appear
// whole once theirs is over.
function getShownLength({ line, elapsedMs }: { line: ReplayLine; elapsedMs: number }) {
  if (elapsedMs >= getLineDuration(line)) return line.text.length;

  switch (line.kind) {
    case "prompt":
      return Math.max(0, Math.floor((elapsedMs - PROMPT_PAUSE_MS) / TYPING_MS_PER_CHARACTER));
    case "reply":
      return 0;
    default: {
      const unknownKind: never = line.kind;
      return unknownKind;
    }
  }
}

type GetReplayFrameParams = {
  script: readonly ReplayLine[];
  elapsedMs: number;
};

// The session `elapsedMs` after it starts.
export function getReplayFrame({ script, elapsedMs }: GetReplayFrameParams): ReplayFrameLine[] {
  let lineStartMs = 0;

  return script.map((line) => {
    const shownLength = getShownLength({ line, elapsedMs: elapsedMs - lineStartMs });
    lineStartMs += getLineDuration(line);

    return {
      ...line,
      shownText: line.text.slice(0, shownLength),
      hiddenText: line.text.slice(shownLength),
    };
  });
}
