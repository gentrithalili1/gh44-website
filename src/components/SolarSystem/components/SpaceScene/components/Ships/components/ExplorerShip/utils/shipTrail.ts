// Every few seconds the engine puffs a short trail of particles that drift back and fade.
const TRAIL_PERIOD_SECONDS = 7;
const PUFF_SPACING_SECONDS = 0.18;
const PUFF_LIFE_SECONDS = 1.1;
// How far a puff drifts behind the engine over its life, in system units.
const PUFF_DRIFT = 9;
const PUFF_OPACITY = 0.6;
const PUFF_SHRINK = 0.6;
// Puffs alternate a little to each side of the engine's line.
const PUFF_SWAY = 0.5;

export const PUFF_COUNT = 6;

type GetTrailPuffParams = { index: number; time: number };

// Where puff `index` is at `time` (seconds), behind the engine; null while it is not out.
export function getTrailPuff({ index, time }: GetTrailPuffParams) {
  const age = (time % TRAIL_PERIOD_SECONDS) - index * PUFF_SPACING_SECONDS;
  if (age < 0 || age > PUFF_LIFE_SECONDS) return null;
  const progress = age / PUFF_LIFE_SECONDS;

  return {
    x: (index % 2 === 0 ? 1 : -1) * PUFF_SWAY * progress,
    y: progress * PUFF_DRIFT,
    opacity: (1 - progress) * PUFF_OPACITY,
    scale: 1 - progress * PUFF_SHRINK,
  };
}
