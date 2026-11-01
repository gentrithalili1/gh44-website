import { useEffect, useRef } from "react";

import type { Playback } from "../useFlokiVoice";
import { getSignalLevel } from "./utils/signalLevel";

const FFT_SIZE = 512;

type Signal = {
  context: AudioContext;
  analyser: AnalyserNode;
  samples: Float32Array<ArrayBuffer>;
  mic: { stream: MediaStream; source: MediaStreamAudioSourceNode } | undefined;
};

// Floki's signal: how loud the visitor's mic or his own voice is right now, for the strip's
// bars. Browsers without Web Audio, or a refused mic, give a flat signal.
export function useFlokiSignal() {
  const signalRef = useRef<Signal | undefined>(undefined);
  // Whether the mic should be open: a mic that opens after the turn ended closes at once.
  const isMicWantedRef = useRef(false);

  // Closing the cockpit closes the mic and the audio graph.
  useEffect(() => {
    return () => {
      const signal = signalRef.current;
      signalRef.current = undefined;
      isMicWantedRef.current = false;
      signal?.mic?.stream.getTracks().forEach((track) => track.stop());
      signal?.context.close().catch(() => {
        // Already closed: nothing left to release.
      });
    };
  }, []);

  function getSignal() {
    if (signalRef.current) return signalRef.current;
    if (typeof AudioContext === "undefined") return undefined;
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    signalRef.current = {
      context,
      analyser,
      samples: new Float32Array(FFT_SIZE),
      mic: undefined,
    };

    return signalRef.current;
  }

  // Starts the audio graph. Call it straight from a click or key press: browsers only let audio
  // start from one.
  function prepare() {
    getSignal()
      ?.context.resume()
      .catch(() => {
        // Refused or closed: lines then play on their own audio element.
      });
  }

  // Plays one of Floki's lines through the analyser on its way to the speakers. The graph was
  // started by a tap or key press, so Safari lets it play after the network round trip. A graph
  // that never started gives undefined, and the line plays on its own audio element.
  async function playVoice(audioUrl: string): Promise<Playback | undefined> {
    const signal = signalRef.current;
    if (signal?.context.state !== "running") return undefined;
    try {
      const base64 = audioUrl.slice(audioUrl.indexOf(",") + 1);
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      const buffer = await signal.context.decodeAudioData(bytes.buffer);
      const source = signal.context.createBufferSource();
      source.buffer = buffer;
      source.connect(signal.analyser);
      source.connect(signal.context.destination);
      let finish = () => {};
      const done = new Promise<void>((resolve) => {
        finish = resolve;
        source.addEventListener("ended", () => resolve());
      });
      source.start();

      return {
        done,
        stop: () => {
          source.removeEventListener("ended", finish);
          source.disconnect();
          finish();
        },
      };
    } catch {
      // Audio the graph can't decode: it plays on its own audio element instead.
      return undefined;
    }
  }

  function closeMic() {
    isMicWantedRef.current = false;
    const signal = signalRef.current;
    if (!signal?.mic) return;
    signal.mic.source.disconnect();
    signal.mic.stream.getTracks().forEach((track) => track.stop());
    signal.mic = undefined;
  }

  // Listens to the mic only to draw it: speech recognition hears the words on its own.
  async function openMic() {
    const signal = getSignal();
    if (!signal || !navigator.mediaDevices) return;
    isMicWantedRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isMicWantedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const source = signal.context.createMediaStreamSource(stream);
      source.connect(signal.analyser);
      signal.mic = { stream, source };
    } catch {
      // Refused or missing mic: the bars stay flat while he listens.
      isMicWantedRef.current = false;
    }
  }

  function getLevel() {
    const signal = signalRef.current;
    if (!signal) return 0;
    signal.analyser.getFloatTimeDomainData(signal.samples);

    return getSignalLevel(signal.samples);
  }

  return { prepare, playVoice, openMic, closeMic, getLevel };
}
