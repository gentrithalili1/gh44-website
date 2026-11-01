import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";

import type { SpeakFlokiOutcome } from "./types";
import { FLOKI_MAX_REPLY_LENGTH } from "./utils/flokiPrompt";
import { takeRequest } from "./utils/rateLimit";

const TIMEOUT_MS = 15_000;
// Floki speaks his own lines and a few short ones of the terminal's, never more than a reply.
const MAX_TEXT_LENGTH = FLOKI_MAX_REPLY_LENGTH;

// Recent request times per visitor IP. In memory: it resets when the server restarts.
const requestTimes = new Map<string, readonly number[]>();

function validateText(input: unknown) {
  if (typeof input !== "string") throw new Error("Expected text");
  const text = input.trim();
  if (text === "" || text.length > MAX_TEXT_LENGTH) throw new Error("Expected a short line");

  return text;
}

function isAllowed() {
  const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
  const result = takeRequest({ times: requestTimes.get(ip) ?? [], now: Date.now() });
  requestTimes.set(ip, result.times);

  return result.isAllowed;
}

// Turns one of Floki's lines into speech with Piper (floki-voice), on the server, which reaches
// the voice service over the private network.
export const speakFloki = createServerFn({ method: "POST" })
  .validator(validateText)
  .handler(async ({ data: text }): Promise<SpeakFlokiOutcome> => {
    const voiceUrl = process.env.FLOKI_TTS_URL;
    if (!voiceUrl) return { status: "failed", reason: "unavailable" };
    if (!isAllowed()) return { status: "failed", reason: "rateLimited" };

    try {
      const response = await fetch(new URL("/synthesize", voiceUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        console.error(`Floki: the voice answered ${response.status}`);
        return { status: "failed", reason: "unavailable" };
      }
      const audio = Buffer.from(await response.arrayBuffer()).toString("base64");

      return { status: "spoken", audioUrl: `data:audio/wav;base64,${audio}` };
    } catch (error) {
      // A timeout or a network failure: this line stays silent.
      console.error("Floki: the voice request failed", error);
      return { status: "failed", reason: "unavailable" };
    }
  });
