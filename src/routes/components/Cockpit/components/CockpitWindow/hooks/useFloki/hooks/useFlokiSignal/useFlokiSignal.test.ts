import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useFlokiSignal } from "./useFlokiSignal";

// A stand-in Web Audio graph whose analyser always reads the same loudness.
function stubAudioContext(sample: number) {
  const track = { stop: vi.fn() };
  const close = vi.fn(async () => {});
  class FakeAudioContext {
    state = "running";
    resume = vi.fn(async () => {});
    close = close;
    destination = {};
    createAnalyser() {
      return {
        fftSize: 0,
        getFloatTimeDomainData: (samples: Float32Array) => samples.fill(sample),
      };
    }
    createMediaStreamSource() {
      return { connect: vi.fn(), disconnect: vi.fn() };
    }
  }
  vi.stubGlobal("AudioContext", FakeAudioContext);
  vi.stubGlobal("navigator", {
    mediaDevices: { getUserMedia: vi.fn(async () => ({ getTracks: () => [track] })) },
  });

  return { track, close };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFlokiSignal", () => {
  it("is flat before anything plays", () => {
    const { result } = renderHook(() => useFlokiSignal());

    expect(result.current.getLevel()).toBe(0);
  });

  it("reads the mic while it is open, and releases it after", async () => {
    const { track } = stubAudioContext(0.25);
    const { result } = renderHook(() => useFlokiSignal());

    await act(() => result.current.openMic());

    expect(result.current.getLevel()).toBe(1);
    act(() => result.current.closeMic());
    expect(track.stop).toHaveBeenCalled();
  });

  it("closes the audio graph when the cockpit closes", () => {
    const { close } = stubAudioContext(0);
    const { result, unmount } = renderHook(() => useFlokiSignal());

    act(() => result.current.prepare());
    unmount();

    expect(close).toHaveBeenCalled();
  });
});
