import { useEffect, useRef, useState } from "react";

import type { SpeakFlokiOutcome } from "../../types";
import { speakFloki } from "./speakFloki";
import type { Playback, PlayVoice } from "./types";

// What happened to a line: it played to the end, a new line, stop or closing the cockpit cut it
// off, the browser blocked sound before the visitor's first click or key, or it could not be
// voiced.
export type FlokiSpeech = "spoken" | "interrupted" | "blocked" | "silent";

async function requestSpeech(text: string): Promise<SpeakFlokiOutcome> {
  try {
    return await speakFloki({ data: text });
  } catch {
    // The server could not be reached: the line stays on screen, unspoken.
    return { status: "failed", reason: "unavailable" };
  }
}

// A plain audio element: the fallback when the audio graph can't play the line.
function playElement(audioUrl: string): Playback {
  const audio = new Audio(audioUrl);
  let finish: (result: "ended" | "blocked") => void = () => {};
  const done = new Promise<"ended" | "blocked">((resolve) => {
    finish = resolve;
    audio.addEventListener("ended", () => resolve("ended"));
    audio.addEventListener("error", () => resolve("ended"));
  });
  audio.play().catch((error: unknown) => {
    // No click or key press yet: blocked. Broken audio: the line counts as done.
    const isBlocked = error instanceof DOMException && error.name === "NotAllowedError";
    finish(isBlocked ? "blocked" : "ended");
  });

  return {
    done,
    stop: () => {
      audio.pause();
      finish("ended");
    },
  };
}

type UseFlokiVoiceParams = {
  // Plays a line through the audio graph, which a tap or key press already started, so Safari
  // lets it play after the network round trip.
  playVoice?: PlayVoice;
};

// Floki's voice: speaks one line at a time. A new line, stop, or closing the cockpit cuts off
// the one playing, including one still on its way from the server.
export function useFlokiVoice({ playVoice }: UseFlokiVoiceParams = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const playbackRef = useRef<Playback | undefined>(undefined);
  // Bumped by every new line, every stop and closing the cockpit, so a line that is cut off
  // never plays.
  const lineIdRef = useRef(0);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      lineIdRef.current += 1;
      playbackRef.current?.stop();
    };
  }, []);

  function stop() {
    lineIdRef.current += 1;
    playbackRef.current?.stop();
    playbackRef.current = undefined;
    setIsSpeaking(false);
  }

  async function speak(text: string): Promise<FlokiSpeech> {
    stop();
    if (!isMountedRef.current) return "interrupted";
    const lineId = lineIdRef.current;
    function isCurrent() {
      return lineId === lineIdRef.current;
    }
    // Speaking from the moment the line is asked for, so a tap meanwhile stops it.
    setIsSpeaking(true);
    const outcome = await requestSpeech(text);
    if (!isCurrent()) return "interrupted";
    if (outcome.status === "failed") {
      setIsSpeaking(false);
      return "silent";
    }
    const playback = (await playVoice?.(outcome.audioUrl)) ?? playElement(outcome.audioUrl);
    if (!isCurrent()) {
      playback.stop();
      return "interrupted";
    }
    playbackRef.current = playback;
    const result = await playback.done;
    if (!isCurrent()) return "interrupted";
    playbackRef.current = undefined;
    setIsSpeaking(false);

    return result === "blocked" ? "blocked" : "spoken";
  }

  return { isSpeaking, speak, stop };
}
