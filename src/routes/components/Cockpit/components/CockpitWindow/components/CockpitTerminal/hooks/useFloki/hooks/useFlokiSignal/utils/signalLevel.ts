// A loud voice reaches about this RMS; it maps to a full signal.
const FULL_RMS = 0.25;

// How loud a slice of audio is, from 0 (silence) to 1, from its samples (-1 to 1).
export function getSignalLevel(samples: ArrayLike<number>) {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index] ?? 0;
    sum += sample * sample;
  }

  return Math.min(1, Math.sqrt(sum / samples.length) / FULL_RMS);
}
