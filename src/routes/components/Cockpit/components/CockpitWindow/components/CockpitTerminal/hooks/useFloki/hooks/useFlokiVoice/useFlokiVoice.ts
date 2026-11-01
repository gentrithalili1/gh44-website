import { useEffect, useRef, useState } from "react";

import { speakFloki } from "../../speakFloki";
import type { SpeakFlokiOutcome } from "../../types";

// What happened to a line: it played to the end, a new line or stop cut it off, or it could not
// be voiced.
export type FlokiSpeech = "spoken" | "interrupted" | "silent";

type Playback = { audio: HTMLAudioElement; finish: () => void };

async function requestSpeech(text: string): Promise<SpeakFlokiOutcome> {
  try {
    return await speakFloki({ data: text });
  } catch {
    // The server could not be reached: the line stays on screen, unspoken.
    return { status: "failed", reason: "unavailable" };
  }
}

function play({
  audio,
  onStart,
}: {
  audio: HTMLAudioElement;
  onStart: (playback: Playback) => void;
}) {
  return new Promise<void>((resolve) => {
    function finish() {
      audio.removeEventListener("ended", finish);
      audio.removeEventListener("error", finish);
      resolve();
    }
    audio.addEventListener("ended", finish);
    audio.addEventListener("error", finish);
    onStart({ audio, finish });
    // Refused (no gesture yet) or broken audio: the line counts as done.
    audio.play().catch(finish);
  });
}

// Floki's voice: speaks one line at a time. A new line, or stop, cuts off the one playing.
export function useFlokiVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const playbackRef = useRef<Playback | null>(null);
  // Bumped by every new line and every stop, so a line that arrives late stays silent.
  const lineIdRef = useRef(0);

  // Closing the cockpit silences him.
  useEffect(() => {
    return () => {
      lineIdRef.current += 1;
      playbackRef.current?.audio.pause();
    };
  }, []);

  function stop() {
    lineIdRef.current += 1;
    setIsSpeaking(false);
    const playback = playbackRef.current;
    if (!playback) return;
    playback.audio.pause();
    playback.finish();
  }

  async function speak(text: string): Promise<FlokiSpeech> {
    stop();
    const lineId = lineIdRef.current;
    const outcome = await requestSpeech(text);
    if (lineId !== lineIdRef.current) return "interrupted";
    if (outcome.status === "failed") return "silent";

    setIsSpeaking(true);
    await play({
      audio: new Audio(outcome.audioUrl),
      onStart: (playback) => {
        playbackRef.current = playback;
      },
    });
    if (lineId !== lineIdRef.current) return "interrupted";
    playbackRef.current = null;
    setIsSpeaking(false);

    return "spoken";
  }

  return { isSpeaking, speak, stop };
}
