import { describe, expect, it } from "vitest";

import { getTrackIndex, TRACKS } from "./tracks";

describe("TRACKS", () => {
  it("plays s.t.a.y., then spacewalk", () => {
    expect(TRACKS).toEqual([
      { id: "stay", title: "s.t.a.y.", artist: "hans zimmer", path: "/audio/stay.mp3" },
      {
        id: "spacewalk",
        title: "spacewalk",
        artist: "thomas newman",
        path: "/audio/spacewalk.mp3",
      },
    ]);
  });
});

describe("getTrackIndex", () => {
  it("steps to the next and previous track, wrapping around both ends", () => {
    expect(getTrackIndex({ index: 0, step: 1, count: 3 })).toBe(1);
    expect(getTrackIndex({ index: 2, step: 1, count: 3 })).toBe(0);
    expect(getTrackIndex({ index: 0, step: -1, count: 3 })).toBe(2);
  });

  it("stays put with a single track", () => {
    expect(getTrackIndex({ index: 0, step: 1, count: 1 })).toBe(0);
    expect(getTrackIndex({ index: 0, step: -1, count: 1 })).toBe(0);
  });
});
