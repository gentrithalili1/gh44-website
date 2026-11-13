import { useEffect, useRef, useState } from "react";

import type { SpeechRecognitionClass, SpeechRecognitionLike } from "./types";

const LANGUAGE = "en-US";
// Errors that mean the visitor (or the browser) refused the microphone.
const DENIED_ERRORS: readonly string[] = ["not-allowed", "service-not-allowed"];
// Errors that only mean nothing was said.
const QUIET_ERRORS: readonly string[] = ["no-speech", "aborted"];
// iOS's recognizer sometimes never ends, not even on stop: the turn ends anyway after this long.
const STOP_GRACE_MS = 600;
// The longest one turn at the mic may last.
const MAX_LISTEN_MS = 15_000;

export type FlokiListeningStatus = "unsupported" | "idle" | "listening";

// What one turn at the mic gave: words, silence, a refused mic, or a broken recognizer.
export type FlokiHearing =
  | { status: "heard"; text: string }
  | { status: "quiet" }
  | { status: "denied" }
  | { status: "failed" };

function isRecognitionClass(value: unknown): value is SpeechRecognitionClass {
  return typeof value === "function";
}

function getRecognitionClass() {
  if (typeof window === "undefined") return undefined;
  const candidate: unknown =
    "SpeechRecognition" in window
      ? window.SpeechRecognition
      : Reflect.get(window, "webkitSpeechRecognition");

  return isRecognitionClass(candidate) ? candidate : undefined;
}

function getHearingForError(error: string): FlokiHearing {
  if (DENIED_ERRORS.includes(error)) return { status: "denied" };
  if (QUIET_ERRORS.includes(error)) return { status: "quiet" };

  return { status: "failed" };
}

export function useFlokiListening() {
  const [status, setStatus] = useState<FlokiListeningStatus>(() =>
    getRecognitionClass() ? "idle" : "unsupported",
  );
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Ends the turn at the mic now, with what was heard so far.
  const finishRef = useRef<(() => void) | undefined>(undefined);

  // Closing the cockpit closes the mic.
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      finishRef.current?.();
    };
  }, []);

  // Asks the recognizer to end the turn; one that doesn't is cut off.
  function stop() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.stop();
    setTimeout(() => {
      if (recognitionRef.current !== recognition) return;
      recognition.abort();
      finishRef.current?.();
    }, STOP_GRACE_MS);
  }

  function listen() {
    const Recognition = getRecognitionClass();
    if (!Recognition || recognitionRef.current) {
      return Promise.resolve<FlokiHearing>({ status: "failed" });
    }
    const recognition = new Recognition();
    recognition.lang = LANGUAGE;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setStatus("listening");

    return new Promise<FlokiHearing>((resolve) => {
      let hearing: FlokiHearing = { status: "quiet" };
      const timeout = setTimeout(stop, MAX_LISTEN_MS);
      // Runs once: on the recognizer's end, or when a stop or closing the cockpit cuts it off.
      function finish() {
        if (recognitionRef.current !== recognition) return;
        clearTimeout(timeout);
        recognitionRef.current = null;
        finishRef.current = undefined;
        setStatus("idle");
        resolve(hearing);
      }
      finishRef.current = finish;
      recognition.onresult = (event) => {
        const text = event.results[0]?.[0]?.transcript.trim() ?? "";
        if (text !== "") hearing = { status: "heard", text };
      };
      recognition.onerror = (event) => {
        hearing = getHearingForError(event.error);
      };
      recognition.onend = finish;
      try {
        recognition.start();
      } catch {
        // Already started elsewhere, or blocked: this turn hears nothing.
        hearing = { status: "failed" };
        finish();
      }
    });
  }

  return { status, listen, stop };
}
