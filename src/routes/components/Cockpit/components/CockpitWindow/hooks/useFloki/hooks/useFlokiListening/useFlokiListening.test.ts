import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubSpeechRecognition } from "#/test/floki";

import { useFlokiListening } from "./useFlokiListening";

afterEach(() => {
  vi.unstubAllGlobals();
});

async function listenOnce(result: { current: ReturnType<typeof useFlokiListening> }) {
  let hearing;
  await act(async () => {
    hearing = await result.current.listen();
  });
  return hearing;
}

describe("useFlokiListening", () => {
  it("is unsupported without speech recognition", () => {
    const { result } = renderHook(() => useFlokiListening());

    expect(result.current.status).toBe("unsupported");
  });

  it("hears one english sentence", async () => {
    const recognizers = stubSpeechRecognition([{ text: " take me to work " }]);
    const { result } = renderHook(() => useFlokiListening());

    expect(await listenOnce(result)).toEqual({ status: "heard", text: "take me to work" });
    expect(recognizers[0]).toMatchObject({
      lang: "en-US",
      continuous: false,
      interimResults: false,
    });
    expect(result.current.status).toBe("idle");
  });

  it.each([
    ["not-allowed", "denied"],
    ["no-speech", "quiet"],
    ["network", "failed"],
  ])("turns a %s error into %s", async (error, status) => {
    stubSpeechRecognition([{ error }]);
    const { result } = renderHook(() => useFlokiListening());

    expect(await listenOnce(result)).toEqual({ status });
  });

  it("closes the mic when the cockpit closes", async () => {
    const recognizers = stubSpeechRecognition([{ text: "hello" }]);
    const { result, unmount } = renderHook(() => useFlokiListening());

    act(() => {
      void result.current.listen();
    });
    unmount();

    expect(recognizers[0]?.abort).toHaveBeenCalled();
  });
});
