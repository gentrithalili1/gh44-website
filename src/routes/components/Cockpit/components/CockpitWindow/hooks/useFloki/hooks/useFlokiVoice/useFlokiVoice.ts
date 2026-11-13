import { useEffect, useRef, useState } from "react";

import type { SpeakFlokiOutcome } from "../../types";
import { speakFloki } from "./speakFloki";
import type { Playback, PlayVoice } from "./types";
import { setAudioSessionType } from "./utils/audioSession";

// A moment of silence: played inside a tap to unlock the voice's audio element on iOS.
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

export type FlokiSpeech = "spoken" | "interrupted" | "blocked" | "silent";

async function requestSpeech(text: string): Promise<SpeakFlokiOutcome> {
  try {
    return await speakFloki({ data: text });
  } catch {
    // The server could not be reached: the line stays on screen, unspoken.
    return { status: "failed", reason: "unavailable" };
  }
}

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
  playVoice?: PlayVoice;
};

export function useFlokiVoice({ playVoice }: UseFlokiVoiceParams = {}) {
  // Preparing while the line is on its way from the server, speaking once it plays.
  const [status, setStatus] = useState<"quiet" | "preparing" | "speaking">("quiet");
  const playbackRef = useRef<Playback | undefined>(undefined);
  // The audio element a tap unlocked, reused for every line.
  const elementRef = useRef<HTMLAudioElement | undefined>(undefined);
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

  function prepare() {
    if (elementRef.current || typeof Audio === "undefined") return;
    const audio = new Audio(SILENT_WAV);
    elementRef.current = audio;
    audio.play().catch(() => {
      if (elementRef.current === audio) elementRef.current = undefined;
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
