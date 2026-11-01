import { useEffect, useRef } from "react";

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
      signal?.mic?.stream.getTracks().forEach((track) => track.stop());
      void signal?.context.close();
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
    void getSignal()?.context.resume();
  }

  // Routes one of Floki's lines through the analyser on its way to the speakers. A graph that
  // never started would mute him, so then the line plays on its own, undrawn.
  function connectVoice(audio: HTMLAudioElement) {
    const signal = signalRef.current;
    if (signal?.context.state !== "running") return;
    const source = signal.context.createMediaElementSource(audio);
    source.connect(signal.analyser);
    source.connect(signal.context.destination);
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

  return { prepare, connectVoice, openMic, closeMic, getLevel };
}
