import { createServerFn } from "@tanstack/react-start";

import { createRateLimit, FLOKI_TIMEOUT_MS } from "../../flokiLimits";
import type { SpeakFlokiOutcome } from "../../types";
import { FLOKI_MAX_REPLY_LENGTH } from "../../utils/flokiPrompt";

// Floki speaks his own lines and a few short ones of the terminal's, never more than a reply.
const MAX_TEXT_LENGTH = FLOKI_MAX_REPLY_LENGTH;

const isAllowed = createRateLimit();

function validateText(input: unknown) {
  if (typeof input !== "string") throw new Error("Expected text");
  const text = input.trim();
  if (text === "" || text.length > MAX_TEXT_LENGTH) throw new Error("Expected a short line");

  return text;
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
        signal: AbortSignal.timeout(FLOKI_TIMEOUT_MS),
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
