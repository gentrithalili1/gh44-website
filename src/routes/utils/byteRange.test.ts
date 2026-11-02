import { describe, expect, it } from "vitest";

import { getByteRange } from "./byteRange";

const SIZE = 1000;

describe("getByteRange", () => {
  it("sends the whole file without a range", () => {
    expect(getByteRange({ header: null, size: SIZE })).toEqual({ status: "whole" });
    expect(getByteRange({ header: "bytes=0-1,5-9", size: SIZE })).toEqual({ status: "whole" });
  });

  it("reads open, closed and suffix ranges", () => {
    expect(getByteRange({ header: "bytes=0-", size: SIZE })).toEqual({
      status: "partial",
      start: 0,
      end: 999,
    });
    expect(getByteRange({ header: "bytes=100-199", size: SIZE })).toEqual({
      status: "partial",
      start: 100,
      end: 199,
    });
    expect(getByteRange({ header: "bytes=-100", size: SIZE })).toEqual({
      status: "partial",
      start: 900,
      end: 999,
    });
  });

  it("clamps an end past the file", () => {
    expect(getByteRange({ header: "bytes=900-5000", size: SIZE })).toEqual({
      status: "partial",
      start: 900,
      end: 999,
    });
  });

  it("refuses a range that starts past the file", () => {
    expect(getByteRange({ header: "bytes=1000-", size: SIZE })).toEqual({
      status: "unsatisfiable",
    });
  });
});
