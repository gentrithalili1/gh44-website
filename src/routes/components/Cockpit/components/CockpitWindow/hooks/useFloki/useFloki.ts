import { useRef, useState } from "react";

import { useMusic } from "#/routes/hooks/useMusic";
import { getTrackIndex, type Track } from "#/routes/hooks/useMusic/utils/tracks";
import { DESTINATIONS, type Destination } from "#/utils/destinations";

import { askFloki, MAX_TURN_LENGTH } from "./askFloki";
import { type FlokiHearing, useFlokiListening } from "./hooks/useFlokiListening";
import { useFlokiSignal } from "./hooks/useFlokiSignal";
import { useFlokiVoice } from "./hooks/useFlokiVoice";
import type { AskFlokiOutcome, FlokiPlace, FlokiTurn } from "./types";
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
  // A radio order: carried out once he has said it (playRadio, stopRadio).
  | { status: "radioPlaying"; track: Track; trackIndex: number }
  | { status: "radioStopped" }
  | { status: "jumping"; say: string | undefined }
  | { status: "returning"; say: string | undefined }
  | { status: "explainingPlace" }
  // Stopped while he was thinking: nothing to say or do.
  | { status: "cancelled" }
  | { status: "failed"; reason: FlokiFailureReason };

async function requestAnswer({
  turns,
  humor,
  place,
}: {
  turns: readonly FlokiTurn[];
  humor: number;
  place: FlokiPlace;
}): Promise<AskFlokiOutcome> {
  try {
    return await askFloki({ data: { turns, humor, place } });
  } catch {
    // The server could not be reached, or refused the question.
    return { status: "failed", reason: "unavailable" };
  }
}

export type Floki = ReturnType<typeof useFloki>;

type UseFlokiParams = {
  // Where he and the visitor are; aboard the ship unless told otherwise.
  place?: FlokiPlace;
};

export function useFloki({ place = "cockpit" }: UseFlokiParams = {}) {
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
  function getRadioTrack(trackIndex: number): FlokiOutcome {
    const track = music.tracks[trackIndex];
    const { status } = music.getState();
    if (status === "checking" || status === "unavailable" || !track) {
      return { status: "failed", reason: "radioUnavailable" };
    }

    return { status: "radioPlaying", track, trackIndex };
  }

  // Read from the player, not the render: a turn at the mic can outlive the render it began in.
  function getMusicOutcome(action: FlokiMusicAction): FlokiOutcome {
    const count = music.tracks.length;
    const { trackIndex } = music.getState();
    switch (action) {
      case "play":
        return getRadioTrack(trackIndex);
      case "next":
        return getRadioTrack(getTrackIndex({ index: trackIndex, step: 1, count }));
      case "previous":
        return getRadioTrack(getTrackIndex({ index: trackIndex, step: -1, count }));
      case "stop":
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
    const command = getFlokiCommand({ text: question, tracks: music.tracks, place });
    switch (command?.kind) {
      case "go":
        return { status: "navigating", destination: command.destination };
      case "humor":
        setHumor(command.humor);
        return { status: "humorSet", humor: command.humor };
      case "music":
        return getMusicOutcome(command.action);
      case "track":
        return getRadioTrack(command.trackIndex);
      case "gargantua":
        return { status: "jumping", say: undefined };
      case "back":
        return { status: "returning", say: undefined };
      case "place":
        return { status: "explainingPlace" };
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
    music.hold();
    const outcome = await requestAnswer({
      turns: [...turns.slice(-HISTORY_TURNS), visitorTurn],
      humor,
      place,
    });
    music.release();
    if (questionId !== questionIdRef.current) return { status: "cancelled" };
    setRequestStatus("idle");
    if (outcome.status === "failed") return outcome;

    const { say, go, gargantua, back } = outcome.reply;
    setTurns((current) => [...current, visitorTurn, { role: "floki", text: say }]);
    if (back && place === "tesseract") return { status: "returning", say };
    if (gargantua && place === "cockpit") return { status: "jumping", say };

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

  async function listen(): Promise<FlokiHearing> {
    if (listening.status === "listening") return { status: "failed" };
    prepareAudio();
    voice.stop();
    // The mic would hear the radio: it pauses until he is done.
    music.hold();
    void signal.openMic();
    const hearing = await listening.listen();
    signal.closeMic();
    music.release();

    return hearing;
  }

  async function speak(text: string) {
    prepareAudio();
    music.hold();
    const speech = await voice.speak(text);
    music.release();

    return speech;
  }

  async function playRadio(trackIndex: number) {
    await music.playTrack(trackIndex);
  }

  // Says hello, once. A greeting the browser blocked (no click or key yet) can be tried again.
  async function greet(text: string) {
    if (greeting === "done") return "spoken";
    setGreeting("done");
    const speech = await speak(text);
    if (speech === "blocked") setGreeting("pending");

    return speech;
  }

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
    prepareAudio,
    playRadio,
    stopRadio: music.stop,
    getLevel: signal.getLevel,
  };
}
