// Poked this many times within this many seconds, the sun flares.
export const POKES_TO_FLARE = 5;
const POKE_WINDOW = 3;
// The flare lasts this many seconds, strongest at once and easing off.
export const FLARE_SECONDS = 2.4;

type AddPokeParams = {
  // When each recent poke landed (seconds), oldest first.
  pokes: readonly number[];
  now: number;
};

// Counts a poke: the recent pokes to keep, and whether this one sets the sun off (which starts
// the count over).
export function addPoke({ pokes, now }: AddPokeParams) {
  const recent = [...pokes.filter((poke) => now - poke < POKE_WINDOW), now];
  const isFlare = recent.length >= POKES_TO_FLARE;

  return { pokes: isFlare ? [] : recent, isFlare };
}

type GetFlareLevelParams = { flaredAt: number | null; now: number };

// 1 as the flare goes off, easing to 0 when it is over; 0 without one.
export function getFlareLevel({ flaredAt, now }: GetFlareLevelParams) {
  if (flaredAt === null) return 0;
  const left = 1 - (now - flaredAt) / FLARE_SECONDS;

  return left <= 0 ? 0 : left * left;
}
