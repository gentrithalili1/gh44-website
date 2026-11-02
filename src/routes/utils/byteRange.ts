export type ByteRange =
  | { status: "whole" }
  | { status: "partial"; start: number; end: number }
  | { status: "unsatisfiable" };

const SINGLE_RANGE = /^bytes=(\d*)-(\d*)$/;

type GetByteRangeParams = { header: string | null; size: number };

// The part of a file a `Range: bytes=…` header asks for, end inclusive. Only single ranges; any
// other shape gets the whole file, as the spec allows.
export function getByteRange({ header, size }: GetByteRangeParams): ByteRange {
  const match = header ? SINGLE_RANGE.exec(header.trim()) : null;
  if (!match) return { status: "whole" };
  const [, startText = "", endText = ""] = match;
  if (startText === "" && endText === "") return { status: "whole" };

  // `bytes=-500`: the last 500 bytes.
  if (startText === "") {
    const suffix = Number(endText);
    if (suffix === 0) return { status: "unsatisfiable" };
    return { status: "partial", start: Math.max(size - suffix, 0), end: size - 1 };
  }

  const start = Number(startText);
  const end = endText === "" ? size - 1 : Math.min(Number(endText), size - 1);
  if (start >= size || start > end) return { status: "unsatisfiable" };

  return { status: "partial", start, end };
}
