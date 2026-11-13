import { getRequestHeader } from "@tanstack/react-start/server";

import { RATE_LIMIT_WINDOW_MS, takeRequest } from "./utils/rateLimit";

// How long Floki waits for Groq or the voice service.
export const FLOKI_TIMEOUT_MS = 15_000;
// Past this many tracked visitors, the ones with no recent requests are forgotten.
const MAX_TRACKED_VISITORS = 1_000;

function getVisitorIp() {
  const forwarded = getRequestHeader("x-forwarded-for")?.split(",").at(-1)?.trim();

  return forwarded || "unknown";
}

export function createRateLimit() {
  const requestTimes = new Map<string, readonly number[]>();

  function prune(now: number) {
    if (requestTimes.size <= MAX_TRACKED_VISITORS) return;
    for (const [ip, times] of requestTimes) {
      if (times.every((time) => now - time >= RATE_LIMIT_WINDOW_MS)) requestTimes.delete(ip);
    }
  }

  return function isAllowed() {
    const ip = getVisitorIp();
    const now = Date.now();
    const result = takeRequest({ times: requestTimes.get(ip) ?? [], now });
    requestTimes.set(ip, result.times);
    prune(now);

    return result.isAllowed;
  };
}
