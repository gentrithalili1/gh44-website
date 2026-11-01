import { useEffect, useRef, useState } from "react";

import type { SpeechRecognitionClass, SpeechRecognitionLike } from "./types";

const LANGUAGE = "en-US";
// Errors that mean the visitor (or the browser) refused the microphone.
const DENIED_ERRORS: readonly string[] = ["not-allowed", "service-not-allowed"];
// Errors that only mean nothing was said.
const QUIET_ERRORS: readonly string[] = ["no-speech", "aborted"];

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

// Floki's ears: the browser's speech recognition, one sentence per turn. Browsers without it
// (Firefox) are unsupported, and the visitor types instead.
export function useFlokiListening() {
  const [status, setStatus] = useState<FlokiListeningStatus>(() =>
    getRecognitionClass() ? "idle" : "unsupported",
  );
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Closing the cockpit closes the mic.
  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  function stop() {
    recognitionRef.current?.stop();
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
      recognition.onresult = (event) => {
        const text = event.results[0]?.[0]?.transcript.trim() ?? "";
        if (text !== "") hearing = { status: "heard", text };
      };
      recognition.onerror = (event) => {
        hearing = getHearingForError(event.error);
      };
      recognition.onend = () => {
        recognitionRef.current = null;
        setStatus("idle");
        resolve(hearing);
      };
      try {
        recognition.start();
      } catch {
        // Already started elsewhere, or blocked: this turn hears nothing.
        recognitionRef.current = null;
        setStatus("idle");
        resolve({ status: "failed" });
      }
    });
  }

  return { status, listen, stop };
}
