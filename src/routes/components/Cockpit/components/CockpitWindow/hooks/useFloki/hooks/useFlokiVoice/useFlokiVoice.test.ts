import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubFloki } from "#/test/floki";

import { useFlokiSignal } from "../useFlokiSignal";
import { useFlokiVoice } from "./useFlokiVoice";

// iOS Safari's rules, as far as Floki's voice meets them: audio starts only inside a tap, or on
// an element a tap already started; the audio graph starts only inside a tap, and the mic can
// knock it to "interrupted".
function stubIosAudio() {
  let isInTap = false;
  const contexts: IosAudioContext[] = [];

  class IosAudio extends EventTarget {
    src: string;
    paused = true;
    isUnlocked = false;
    pause = vi.fn(() => {
      this.paused = true;
    });
    play = vi.fn(async () => {
      if (!isInTap && !this.isUnlocked) throw new DOMException("Needs a tap", "NotAllowedError");
      this.isUnlocked = true;
      this.paused = false;
      if (this.src.startsWith("data:audio/wav")) {
        queueMicrotask(() => this.dispatchEvent(new Event("ended")));
      }
    });

    constructor(src = "") {
      super();
      this.src = src;
    }
  }

  class IosAudioContext {
    state = "suspended";
    destination = {};
    resume = vi.fn(async () => {
      if (isInTap) this.state = "running";
    });
    close = vi.fn(async () => {});
    decodeAudioData = vi.fn(async () => ({}));

    constructor() {
      contexts.push(this);
    }

    createAnalyser() {
      return { fftSize: 0, getFloatTimeDomainData: vi.fn() };
    }

    createBufferSource() {
      const source = new EventTarget();
      return Object.assign(source, {
        buffer: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: () => queueMicrotask(() => source.dispatchEvent(new Event("ended"))),
      });
    }
  }

  vi.stubGlobal("Audio", IosAudio);
  vi.stubGlobal("AudioContext", IosAudioContext);

  return {
    contexts,
    tap(run: () => void) {
      isInTap = true;
      run();
      isInTap = false;
    },
  };
}

// Floki's voice wired to his audio graph, as useFloki wires them.
function useVoiceWithSignal() {
  const signal = useFlokiSignal();
  const voice = useFlokiVoice({ playVoice: signal.playVoice });

  return { signal, voice };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFlokiVoice", () => {
  it("plays a line to the end", async () => {
    const { players } = stubFloki({ replies: [] });
    const { result } = renderHook(() => useFlokiVoice());

    let speech;
    await act(async () => {
      speech = await result.current.speak("Floki online.");
    });

    expect(speech).toBe("spoken");
    expect(players[0]?.src).toMatch(/^data:audio\/wav;base64,/);
    expect(result.current.status).toBe("quiet");
  });

  it("stays silent when the voice is down", async () => {
    const { players } = stubFloki({ replies: [], hasVoice: false });
    const { result } = renderHook(() => useFlokiVoice());

    let speech;
    await act(async () => {
      speech = await result.current.speak("Floki online.");
    });

    expect(speech).toBe("silent");
    expect(players).toEqual([]);
  });

  it("cuts a line off on stop", async () => {
    const { players } = stubFloki({ replies: [], shouldFinishSpeaking: false });
    const { result } = renderHook(() => useFlokiVoice());

    let speaking: Promise<unknown> = Promise.resolve();
    act(() => {
      speaking = result.current.speak("A long story about Jupiter.");
    });
    await vi.waitFor(() => expect(players[0]?.play).toHaveBeenCalled());
    expect(result.current.status).toBe("speaking");
    act(() => result.current.stop());

    await expect(speaking).resolves.toBe("interrupted");
    expect(players[0]?.pause).toHaveBeenCalled();
    expect(result.current.status).toBe("quiet");
  });

  it("goes quiet when the cockpit closes", async () => {
    const { players } = stubFloki({ replies: [], shouldFinishSpeaking: false });
    const { result, unmount } = renderHook(() => useFlokiVoice());

    act(() => {
      void result.current.speak("Leaving so soon?");
    });
    await vi.waitFor(() => expect(players[0]?.play).toHaveBeenCalled());
    unmount();

    expect(players[0]?.pause).toHaveBeenCalled();
  });

  it("still speaks on iOS after the mic interrupted the audio graph", async () => {
    stubFloki({ replies: [] });
    const ios = stubIosAudio();
    const { result } = renderHook(() => useVoiceWithSignal());

    // The visitor taps ask floki: the graph starts and the voice unlocks. Listening then
    // interrupts the graph.
    await act(async () =>
      ios.tap(() => {
        result.current.signal.prepare();
        result.current.voice.prepare();
      }),
    );
    const [context] = ios.contexts;
    if (context) context.state = "interrupted";

    let speech;
    await act(async () => {
      speech = await result.current.voice.speak("Floki here, how can I help?");
    });

    expect(speech).toBe("spoken");
  });

  it("unlocks on iOS at the first tap after a try without one", async () => {
    stubFloki({ replies: [] });
    const ios = stubIosAudio();
    const { result } = renderHook(() => useFlokiVoice());

    // The cockpit opened by itself: no tap yet, so iOS refuses.
    await act(async () => result.current.prepare());
    await act(async () => ios.tap(() => result.current.prepare()));

    let speech;
    await act(async () => {
      speech = await result.current.speak("Welcome aboard.");
    });

    expect(speech).toBe("spoken");
  });

  it("starts the audio graph in the playback session, so iOS's silent switch doesn't mute it", async () => {
    stubFloki({ replies: [] });
    const ios = stubIosAudio();
    const session = { type: "auto" };
    vi.stubGlobal("navigator", { ...navigator, audioSession: session });
    const { result } = renderHook(() => useVoiceWithSignal());
    const [typeAtStart] = await act(async () => {
      let type = "";
      ios.tap(() => {
        result.current.signal.prepare();
        type = session.type;
      });
      return [type];
    });

    expect(typeAtStart).toBe("playback");
  });
});
