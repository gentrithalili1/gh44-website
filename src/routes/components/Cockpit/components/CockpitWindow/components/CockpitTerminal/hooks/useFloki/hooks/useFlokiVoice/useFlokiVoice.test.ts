import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubFloki } from "#/test/floki";

import { useFlokiVoice } from "./useFlokiVoice";

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
    expect(result.current.isSpeaking).toBe(false);
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
    expect(result.current.isSpeaking).toBe(true);
    act(() => result.current.stop());

    await expect(speaking).resolves.toBe("interrupted");
    expect(players[0]?.pause).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
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
});
