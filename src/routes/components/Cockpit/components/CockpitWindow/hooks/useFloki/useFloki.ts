import { useRef, useState } from "react";

import { useMusic } from "#/routes/hooks/useMusic";
import { getTrackIndex, type Track } from "#/routes/hooks/useMusic/utils/tracks";
import { DESTINATIONS, type Destination } from "#/utils/destinations";

import { askFloki, MAX_TURN_LENGTH } from "./askFloki";
import { type FlokiHearing, useFlokiListening } from "./hooks/useFlokiListening";
import { useFlokiSignal } from "./hooks/useFlokiSignal";
import { useFlokiVoice } from "./hooks/useFlokiVoice";
import type { AskFlokiOutcome, FlokiTurn } from "./types";
import { type FlokiMusicAction, getFlokiCommand } from "./utils/flokiCommand";

// Floki's humor setting until the visitor changes it, in percent.
export const DEFAULT_HUMOR = 80;
// How many earlier turns go along with a question.
const HISTORY_TURNS = 10;
// Questions the model answers per cockpit visit; plain orders don't count.
export const MAX_QUESTIONS = 10;

export type FlokiStatus = "idle" | "listening" | "thinking" | "speaking";

export type FlokiFailureReason =
  | "busy"
  | "questionLimit"
  | "rateLimited"
  | "unavailable"
  | "radioUnavailable";

export type FlokiOutcome =
  | { status: "answered"; say: string; destination: Destination | undefined }
  // A plain order, carried out without asking the model.
  | { status: "navigating"; destination: Destination }
  | { status: "humorSet"; humor: number }
  | { status: "radioPlaying"; track: Track }
  | { status: "radioStopped" }
  // Stopped while he was thinking: nothing to say or do.
  | { status: "cancelled" }
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

// Floki, the explorer's onboard computer: carries out plain orders at once (flying, his humor,
// the radio), takes a question, keeps the conversation while the cockpit is open, and returns
// what he says and where to fly.
// The component prints, speaks and flies.
export type Floki = ReturnType<typeof useFloki>;

export function useFloki() {
  const signal = useFlokiSignal();
  const voice = useFlokiVoice({ playVoice: signal.playVoice });
  const listening = useFlokiListening();
  const music = useMusic();
  const [requestStatus, setRequestStatus] = useState<"idle" | "thinking">("idle");
  const [turns, setTurns] = useState<readonly FlokiTurn[]>([]);
  const [humor, setHumor] = useState(DEFAULT_HUMOR);
  // Floki says hello out loud once a cockpit visit: the welcome, or the first tap of talk.
  const [greeting, setGreeting] = useState<"pending" | "done">("pending");
  // Bumped by stop, so an answer still on its way is dropped.
  const questionIdRef = useRef(0);

  // Starts the audio graph and unlocks the voice's element: only a click or key press can.
  function prepareAudio() {
    signal.prepare();
    voice.prepare();
  }

  // The radio on the visitor's order. Play, next and previous all end with a track playing.
  async function playRadio(trackIndex: number): Promise<FlokiOutcome> {
    if (music.status === "checking" || music.status === "unavailable") {
      return { status: "failed", reason: "radioUnavailable" };
    }
    const track = music.tracks[trackIndex];
    if (!track) return { status: "failed", reason: "radioUnavailable" };
    await music.playTrack(trackIndex);

    return { status: "radioPlaying", track };
  }

  async function runMusicAction(action: FlokiMusicAction): Promise<FlokiOutcome> {
    const count = music.tracks.length;
    switch (action) {
      case "play":
        return playRadio(music.trackIndex);
      case "next":
        return playRadio(getTrackIndex({ index: music.trackIndex, step: 1, count }));
      case "previous":
        return playRadio(getTrackIndex({ index: music.trackIndex, step: -1, count }));
      case "stop":
        music.stop();
        return { status: "radioStopped" };
      default: {
        const unknownAction: never = action;
        return unknownAction;
      }
    }
  }

  async function ask(question: string): Promise<FlokiOutcome> {
    if (requestStatus === "thinking") return { status: "failed", reason: "busy" };
    prepareAudio();
    // A new question cuts him off.
    voice.stop();
    const command = getFlokiCommand({ text: question, tracks: music.tracks });
    switch (command?.kind) {
      case "go":
        return { status: "navigating", destination: command.destination };
      case "humor":
        setHumor(command.humor);
        return { status: "humorSet", humor: command.humor };
      case "music":
        return runMusicAction(command.action);
      case "track":
        return playRadio(command.trackIndex);
      case undefined:
        break;
      default: {
        const unknownCommand: never = command;
        return unknownCommand;
      }
    }
    const questionCount = turns.filter(({ role }) => role === "visitor").length;
    if (questionCount >= MAX_QUESTIONS) return { status: "failed", reason: "questionLimit" };
    const visitorTurn = {
      role: "visitor",
      text: question.trim().slice(0, MAX_TURN_LENGTH),
    } as const;
    setRequestStatus("thinking");
    const questionId = questionIdRef.current;
    const outcome = await requestAnswer({
      turns: [...turns.slice(-HISTORY_TURNS), visitorTurn],
      humor,
    });
    if (questionId !== questionIdRef.current) return { status: "cancelled" };
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
    if (requestStatus === "thinking" || voice.status === "preparing") return "thinking";
    if (voice.status === "speaking") return "speaking";
    return "idle";
  }

  // Opens the mic for one sentence; it cuts Floki off first. Only one turn at a time: the one
  // that opened the mic closes it.
  async function listen(): Promise<FlokiHearing> {
    if (listening.status === "listening") return { status: "failed" };
    prepareAudio();
    voice.stop();
    void signal.openMic();
    const hearing = await listening.listen();
    signal.closeMic();

    return hearing;
  }

  // Says a line out loud; from a click it also starts the audio graph in time.
  function speak(text: string) {
    prepareAudio();
    return voice.speak(text);
  }

  // Says hello, once. A greeting the browser blocked (no click or key yet) can be tried again.
  async function greet(text: string) {
    if (greeting === "done") return "spoken";
    setGreeting("done");
    const speech = await speak(text);
    if (speech === "blocked") setGreeting("pending");

    return speech;
  }

  // Cuts Floki off and drops the answer he is thinking about, for when the visitor takes the
  // controls themselves.
  function stop() {
    questionIdRef.current += 1;
    setRequestStatus("idle");
    voice.stop();
  }

  return {
    status: getStatus(),
    canListen: listening.status !== "unsupported",
    ask,
    listen,
    stopListening: listening.stop,
    speak,
    hasGreeted: greeting === "done",
    greet,
    stopSpeaking: voice.stop,
    stop,
    getLevel: signal.getLevel,
  };
}
