export type Track = { id: string; title: string; artist: string; path: string };

// What the radio plays, in order, round and round. Served from public/audio/, which git ignores:
// the files are not in the repository.
export const TRACKS = [
  { id: "stay", title: "s.t.a.y.", artist: "hans zimmer", path: "/audio/stay.mp3" },
  { id: "spacewalk", title: "spacewalk", artist: "thomas newman", path: "/audio/spacewalk.mp3" },
] as const satisfies readonly Track[];

type GetTrackIndexParams = { index: number; step: 1 | -1; count: number };

// The track `step` away from `index`, wrapping around both ends of the list.
export function getTrackIndex({ index, step, count }: GetTrackIndexParams) {
  return (((index + step) % count) + count) % count;
}
