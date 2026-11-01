// Each visitor (by IP) gets this many questions per window.
export const RATE_LIMIT_REQUESTS = 30;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

type TakeRequestParams = {
  // When each recent request was made (ms), oldest first.
  times: readonly number[];
  now: number;
};

// Whether one more request fits the window, and the times to keep.
export function takeRequest({ times, now }: TakeRequestParams) {
  const recent = times.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_REQUESTS) return { isAllowed: false, times: recent };

  return { isAllowed: true, times: [...recent, now] };
}
