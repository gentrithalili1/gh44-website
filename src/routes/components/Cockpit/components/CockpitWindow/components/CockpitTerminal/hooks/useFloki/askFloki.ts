import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";

import type { AskFlokiInput, AskFlokiOutcome, FlokiTurn } from "./types";
import { getFlokiPrompt } from "./utils/flokiPrompt";
import { getCompletionText, parseFlokiReply } from "./utils/flokiReply";
import { takeRequest } from "./utils/rateLimit";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "qwen/qwen3.8-27b";
// Floki answers at once: no reasoning tokens before the reply.
const REASONING_EFFORT = "none";
const TIMEOUT_MS = 15_000;
const MAX_TOKENS = 200;
const TEMPERATURE = 0.6;
// What one request may carry: the last turns of the conversation, each a short line.
const MAX_TURNS = 20;
const MAX_TURN_LENGTH = 300;
const TOO_MANY_REQUESTS = 429;

// Recent request times per visitor IP. In memory: it resets when the server restarts.
const requestTimes = new Map<string, readonly number[]>();

function isTurn(value: unknown): value is FlokiTurn {
  if (typeof value !== "object" || value === null) return false;
  const role = "role" in value ? value.role : undefined;
  const text = "text" in value ? value.text : undefined;

  return (
    (role === "visitor" || role === "floki") &&
    typeof text === "string" &&
    text.trim() !== "" &&
    text.length <= MAX_TURN_LENGTH
  );
}

function validateInput(input: unknown): AskFlokiInput {
  if (typeof input !== "object" || input === null) throw new Error("Expected an object");
  const turns = "turns" in input ? input.turns : undefined;
  const humor = "humor" in input ? input.humor : undefined;
  if (!Array.isArray(turns) || turns.length === 0 || turns.length > MAX_TURNS) {
    throw new Error("Expected 1 to 20 turns");
  }
  const checkedTurns: unknown[] = turns;
  if (!checkedTurns.every(isTurn)) throw new Error("Expected valid turns");
  if (checkedTurns.at(-1)?.role !== "visitor") throw new Error("The visitor speaks last");
  if (typeof humor !== "number" || humor < 0 || humor > 100) {
    throw new Error("Expected humor from 0 to 100");
  }

  return { turns: checkedTurns, humor: Math.round(humor) };
}

function getVisitorIp() {
  return getRequestIP({ xForwardedFor: true }) ?? "unknown";
}

function isAllowed(ip: string) {
  const result = takeRequest({ times: requestTimes.get(ip) ?? [], now: Date.now() });
  requestTimes.set(ip, result.times);

  return result.isAllowed;
}

async function requestCompletion({ turns, humor, apiKey }: AskFlokiInput & { apiKey: string }) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      reasoning_effort: REASONING_EFFORT,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: getFlokiPrompt({ humor }) },
        ...turns.map(({ role, text }) => ({
          role: role === "visitor" ? "user" : "assistant",
          content: role === "visitor" ? text : JSON.stringify({ say: text }),
        })),
      ],
    }),
  });

  return response;
}

// Asks Floki, on the server so the API key never reaches the browser. Every visitor IP gets a
// limited number of questions per hour.
export const askFloki = createServerFn({ method: "POST" })
  .validator(validateInput)
  .handler(async ({ data }): Promise<AskFlokiOutcome> => {
    const apiKey = process.env.FLOKI_GROQ_API_KEY;
    if (!apiKey) return { status: "failed", reason: "unavailable" };
    if (!isAllowed(getVisitorIp())) return { status: "failed", reason: "rateLimited" };

    try {
      const response = await requestCompletion({ ...data, apiKey });
      if (response.status === TOO_MANY_REQUESTS) return { status: "failed", reason: "rateLimited" };
      if (!response.ok) {
        console.error(`Floki: Groq answered ${response.status}`);
        return { status: "failed", reason: "unavailable" };
      }
      const text = getCompletionText(await response.json());
      const reply = text === undefined ? undefined : parseFlokiReply(text);
      if (!reply) {
        console.error("Floki: Groq sent no usable reply");
        return { status: "failed", reason: "unavailable" };
      }

      return { status: "answered", reply };
    } catch (error) {
      // A timeout or a network failure: Floki is offline for this question.
      console.error("Floki: Groq request failed", error);
      return { status: "failed", reason: "unavailable" };
    }
  });
