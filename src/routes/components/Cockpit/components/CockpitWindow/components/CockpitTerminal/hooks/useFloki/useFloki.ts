import { useState } from "react";

import { DESTINATIONS, type Destination } from "#/utils/destinations";

import { askFloki } from "./askFloki";
import { useFlokiListening } from "./hooks/useFlokiListening";
import { useFlokiSignal } from "./hooks/useFlokiSignal";
import { useFlokiVoice } from "./hooks/useFlokiVoice";
import type { AskFlokiOutcome, FlokiTurn } from "./types";
import { getFlokiCommand } from "./utils/flokiCommand";

// Floki's humor setting until the visitor changes it, in percent.
export const DEFAULT_HUMOR = 60;
// How many earlier turns go along with a question.
const HISTORY_TURNS = 10;

export type FlokiStatus = "idle" | "listening" | "thinking" | "speaking";

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

// Floki, the explorer's onboard computer: carries out plain orders at once, takes a question,
// keeps the conversation while the cockpit is open, and returns what he says and where to fly.
// The component prints, speaks and flies.
export function useFloki() {
  const signal = useFlokiSignal();
  const voice = useFlokiVoice({ onPlay: signal.connectVoice });
  const listening = useFlokiListening();
  const [requestStatus, setRequestStatus] = useState<"idle" | "thinking">("idle");
  const [turns, setTurns] = useState<readonly FlokiTurn[]>([]);
  const [humor, setHumor] = useState(DEFAULT_HUMOR);

  async function ask(question: string): Promise<FlokiOutcome> {
    if (requestStatus === "thinking") return { status: "failed", reason: "busy" };
    signal.prepare();
    // A new question cuts him off.
    voice.stop();
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
    setRequestStatus("thinking");
    const outcome = await requestAnswer({
      turns: [...turns.slice(-HISTORY_TURNS), visitorTurn],
      humor,
    });
    setRequestStatus("idle");
    if (outcome.status === "failed") return outcome;

    const { say, go } = outcome.reply;
    setTurns((current) => [...current, visitorTurn, { role: "floki", text: say }]);

    return {
      status: "answered",
      say,
      destination: DESTINATIONS.find(({ name }) => name === go),
    };
  }

  function getStatus(): FlokiStatus {
    if (listening.status === "listening") return "listening";
    if (requestStatus === "thinking") return "thinking";
    if (voice.isSpeaking) return "speaking";
    return "idle";
  }

  // Opens the mic for one sentence; it cuts Floki off first.
  async function listen() {
    signal.prepare();
    voice.stop();
    void signal.openMic();
    const hearing = await listening.listen();
    signal.closeMic();

    return hearing;
  }

  // Says a line out loud; from a click it also starts the audio graph in time.
  function speak(text: string) {
    signal.prepare();
    return voice.speak(text);
  }

  return {
    status: getStatus(),
    canListen: listening.status !== "unsupported",
    ask,
    listen,
    stopListening: listening.stop,
    speak,
    stopSpeaking: voice.stop,
    getLevel: signal.getLevel,
  };
}
