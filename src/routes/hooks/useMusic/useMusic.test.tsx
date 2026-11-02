import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { removeGestureListeners, stubAudio } from "#/test/audio";

import { MusicProvider, useMusic } from "./useMusic";

// Floki comes back from silence after this long; see RELEASE_DELAY_MS.
const RELEASE_DELAY_MS = 2500;
const FADE_OUT_MS = 600;

function renderMusic() {
  return renderHook(() => useMusic(), {
    wrapper: ({ children }: { children: ReactNode }) => <MusicProvider>{children}</MusicProvider>,
  });
}

function wait(ms: number) {
  act(() => vi.advanceTimersByTime(ms));
}

async function renderPlaying() {
  const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
  const music = renderMusic();
  await waitFor(() => expect(players[0]?.paused).toBe(false));
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "performance",
    ],
  });

  return { players, music };
}

describe("useMusic", () => {
  afterEach(() => {
    removeGestureListeners();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("pauses while Floki holds it, and comes back a moment after he lets go", async () => {
    const { players, music } = await renderPlaying();

    act(() => music.result.current.hold());
    wait(FADE_OUT_MS + 100);
    expect(players[0]?.paused).toBe(true);
    expect(music.result.current.status).toBe("playing");

    act(() => music.result.current.release());
    wait(RELEASE_DELAY_MS - 100);
    expect(players[0]?.paused).toBe(true);
    await act(async () => vi.advanceTimersByTime(200));
    expect(players[0]?.paused).toBe(false);
  });

  it("stays paused across Floki's turns that follow each other", async () => {
    const { players, music } = await renderPlaying();

    act(() => music.result.current.hold());
    act(() => music.result.current.release());
    wait(1000);
    act(() => music.result.current.hold());
    wait(RELEASE_DELAY_MS);

    expect(players[0]?.paused).toBe(true);
  });

  it("keeps the visitor's stop while held", async () => {
    const { players, music } = await renderPlaying();

    act(() => music.result.current.hold());
    act(() => music.result.current.stop());
    act(() => music.result.current.release());
    await act(async () => vi.advanceTimersByTime(RELEASE_DELAY_MS + FADE_OUT_MS));

    expect(players[0]?.paused).toBe(true);
    expect(music.result.current.status).toBe("ready");
  });

  it("comes back on the next tap when the phone refuses to resume it", async () => {
    const { players, music } = await renderPlaying();
    const [player] = players;
    act(() => music.result.current.hold());
    wait(FADE_OUT_MS + 100);
    player?.play.mockRejectedValueOnce(new DOMException("Needs a tap", "NotAllowedError"));

    act(() => music.result.current.release());
    await act(async () => vi.advanceTimersByTime(RELEASE_DELAY_MS + 100));
    expect(music.result.current.status).toBe("ready");

    await act(async () => document.dispatchEvent(new MouseEvent("click")));
    expect(player?.paused).toBe(false);
    expect(music.result.current.status).toBe("playing");
  });
});
