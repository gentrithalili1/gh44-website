// A poke sets the sun off: the flare lasts this many seconds, strongest at once and easing off.
export const FLARE_SECONDS = 2.8;

type GetFlareLevelParams = { flaredAt: number | null; now: number };

// 1 as the flare goes off, easing to 0 when it is over; 0 without one.
export function getFlareLevel({ flaredAt, now }: GetFlareLevelParams) {
  if (flaredAt === null) return 0;
  const left = 1 - (now - flaredAt) / FLARE_SECONDS;

  return left <= 0 ? 0 : left * left;
}
