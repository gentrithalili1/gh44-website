import { useEffect, useRef, useState } from "react";

import type { SpeakFlokiOutcome } from "../../types";
import { speakFloki } from "./speakFloki";
import type { Playback, PlayVoice } from "./types";
import { setAudioSessionType } from "./utils/audioSession";

// A moment of silence: played inside a tap to unlock the voice's audio element on iOS.
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

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

// An audio element: the fallback when the audio graph can't play the line. iOS lets it play
// after the network round trip only if a tap already started it (see prepare).
function playElement({ audio, audioUrl }: { audio: HTMLAudioElement; audioUrl: string }): Playback {
  audio.src = audioUrl;
  let finish: (result: "ended" | "blocked") => void = () => {};
  const done = new Promise<"ended" | "blocked">((resolve) => {
    function handleEnded() {
      resolve("ended");
    }
    finish = resolve;
    audio.addEventListener("ended", handleEnded, { once: true });
    audio.addEventListener("error", handleEnded, { once: true });
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
  // Preparing while the line is on its way from the server, speaking once it plays.
  const [status, setStatus] = useState<"quiet" | "preparing" | "speaking">("quiet");
  const playbackRef = useRef<Playback | undefined>(undefined);
  // The audio element a tap unlocked, reused for every line.
  const elementRef = useRef<HTMLAudioElement | undefined>(undefined);
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

  // Unlocks the voice's audio element. Call it straight from a click or key press: iOS only
  // lets an element play later if a tap started it once.
  function prepare() {
    if (elementRef.current || typeof Audio === "undefined") return;
    const audio = new Audio(SILENT_WAV);
    elementRef.current = audio;
    audio.play().catch(() => {
      // Refused: lines fall back to the audio graph, or stay on screen.
    });
  }

  function stop() {
    lineIdRef.current += 1;
    playbackRef.current?.stop();
    playbackRef.current = undefined;
    // Hands the audio session back, so the mic can take it to listen.
    setAudioSessionType("auto");
    setStatus("quiet");
  }

  async function speak(text: string): Promise<FlokiSpeech> {
    stop();
    if (!isMountedRef.current) return "interrupted";
    const lineId = lineIdRef.current;
    function isCurrent() {
      return lineId === lineIdRef.current;
    }
    // Busy from the moment the line is asked for, so a tap meanwhile stops it.
    setStatus("preparing");
    const outcome = await requestSpeech(text);
    if (!isCurrent()) return "interrupted";
    if (outcome.status === "failed") {
      setStatus("quiet");
      return "silent";
    }
    setAudioSessionType("playback");
    const playback =
      (await playVoice?.(outcome.audioUrl)) ??
      playElement({ audio: elementRef.current ?? new Audio(), audioUrl: outcome.audioUrl });
    if (!isCurrent()) {
      playback.stop();
      return "interrupted";
    }
    playbackRef.current = playback;
    setStatus("speaking");
    const result = await playback.done;
    setAudioSessionType("auto");
    if (!isCurrent()) return "interrupted";
    playbackRef.current = undefined;
    setStatus("quiet");

    return result === "blocked" ? "blocked" : "spoken";
  }

  return { status, prepare, speak, stop };
}
