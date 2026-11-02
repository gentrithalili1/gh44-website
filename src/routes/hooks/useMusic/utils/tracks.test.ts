import { describe, expect, it } from "vitest";

import { getTrackIndex, TRACKS } from "./tracks";

describe("TRACKS", () => {
  it("plays crystalline, s.t.a.y., spacewalk, the starship avalon, then fluturo pellumb", () => {
    expect(TRACKS.map(({ title, artist, path }) => ({ title, artist, path }))).toEqual([
      { title: "crystalline", artist: "thomas newman", path: "/audio/crystalline.mp3" },
      { title: "s.t.a.y.", artist: "hans zimmer", path: "/audio/stay.mp3" },
      { title: "spacewalk", artist: "thomas newman", path: "/audio/spacewalk.mp3" },
      {
        title: "the starship avalon",
        artist: "thomas newman",
        path: "/audio/the-starship-avalon.mp3",
      },
      { title: "fluturo pellumb", artist: "shkurte fejza", path: "/audio/fluturo-pellumb.mp3" },
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
