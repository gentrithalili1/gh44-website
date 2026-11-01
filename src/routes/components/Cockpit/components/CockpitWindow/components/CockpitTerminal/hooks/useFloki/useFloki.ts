import { useState } from "react";

import { DESTINATIONS, type Destination } from "#/utils/destinations";

import { askFloki } from "./askFloki";
import type { AskFlokiOutcome, FlokiTurn } from "./types";
import { getFlokiCommand } from "./utils/flokiCommand";

// Floki's humor setting until the visitor changes it, in percent.
export const DEFAULT_HUMOR = 60;
// How many earlier turns go along with a question.
const HISTORY_TURNS = 10;

export type FlokiStatus = "idle" | "thinking";

export type FlokiFailureReason = "busy" | "rateLimited" | "unavailable";

export type FlokiOutcome =
  | { status: "answered"; say: string; destination: Destination | undefined }
  // A plain order, carried out without asking the model.
  | { status: "navigating"; destination: Destination }
  | { status: "humorSet"; humor: number }
  | { status: "failed"; reason: FlokiFailureReason };

async function requestAnswer({
  turns,
  humor,
}: {
  turns: readonly FlokiTurn[];
  humor: number;
}): Promise<AskFlokiOutcome> {
  try {
    return await askFloki({ data: { turns, humor } });
  } catch {
    // The server could not be reached, or refused the question.
    return { status: "failed", reason: "unavailable" };
  }
}

// Floki, the explorer's onboard computer: carries out plain orders at once, takes a question, keeps the conversation while the
// cockpit is open, and returns what he says and where to fly. The component prints and flies.
export function useFloki() {
  const [status, setStatus] = useState<FlokiStatus>("idle");
  const [turns, setTurns] = useState<readonly FlokiTurn[]>([]);
  const [humor, setHumor] = useState(DEFAULT_HUMOR);

  async function ask(question: string): Promise<FlokiOutcome> {
    if (status !== "idle") return { status: "failed", reason: "busy" };
    const command = getFlokiCommand(question);
    switch (command?.kind) {
      case "go":
        return { status: "navigating", destination: command.destination };
      case "humor":
        setHumor(command.humor);
        return { status: "humorSet", humor: command.humor };
      case undefined:
        break;
      default: {
        const unknownCommand: never = command;
        return unknownCommand;
      }
    }
    const visitorTurn = { role: "visitor", text: question.trim() } as const;
    setStatus("thinking");
    const outcome = await requestAnswer({
      turns: [...turns.slice(-HISTORY_TURNS), visitorTurn],
      humor,
    });
    setStatus("idle");
    if (outcome.status === "failed") return outcome;

    const { say, go } = outcome.reply;
    setTurns((current) => [...current, visitorTurn, { role: "floki", text: say }]);

    return {
      status: "answered",
      say,
      destination: DESTINATIONS.find(({ name }) => name === go),
    };
  }

  return { status, ask };
}
