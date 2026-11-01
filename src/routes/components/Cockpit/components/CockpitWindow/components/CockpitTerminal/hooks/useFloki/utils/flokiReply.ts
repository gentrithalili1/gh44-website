import { DESTINATIONS } from "#/utils/destinations";

import type { FlokiReply } from "../types";
import { FLOKI_MAX_REPLY_LENGTH } from "./flokiPrompt";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Not JSON: the caller treats it as no reply.
    return undefined;
  }
}

// The model's JSON answer, checked: words to say, and a destination only if it is a real one.
export function parseFlokiReply(text: string): FlokiReply | undefined {
  const value = parseJson(text);
  if (!isRecord(value) || typeof value.say !== "string") return undefined;
  const say = value.say.trim().slice(0, FLOKI_MAX_REPLY_LENGTH);
  if (say === "") return undefined;
  const destination = DESTINATIONS.find(({ name }) => name === value.go);

  return { say, go: destination?.name };
}

// The text of the first choice in an OpenAI-style chat completion response.
export function getCompletionText(body: unknown) {
  if (!isRecord(body) || !Array.isArray(body.choices)) return undefined;
  const choice: unknown = body.choices.at(0);
  if (!isRecord(choice) || !isRecord(choice.message)) return undefined;

  return typeof choice.message.content === "string" ? choice.message.content : undefined;
}
