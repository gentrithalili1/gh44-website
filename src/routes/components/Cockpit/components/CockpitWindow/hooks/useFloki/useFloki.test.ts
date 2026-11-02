import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MusicProvider } from "#/routes/hooks/useMusic";
import { TRACKS } from "#/routes/hooks/useMusic/utils/tracks";
import { removeGestureListeners, stubAudio } from "#/test/audio";
import { stubFloki } from "#/test/floki";

import { MAX_QUESTIONS, useFloki } from "./useFloki";

afterEach(() => {
  removeGestureListeners();
  vi.unstubAllGlobals();
});

// Floki works the site's radio, so he needs its player above him.
function renderFloki() {
  return renderHook(() => useFloki(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(MusicProvider, null, children),
  });
}

function getMessages({
  fetchStub,
  call,
}: {
  fetchStub: ReturnType<typeof stubFloki>["fetchStub"];
  call: number;
}): unknown[] {
  const body: unknown = JSON.parse(String(fetchStub.mock.calls[call]?.[1]?.body));
  if (typeof body !== "object" || body === null || !("messages" in body)) return [];
  return Array.isArray(body.messages) ? body.messages : [];
}

describe("useFloki", () => {
  it("answers with what to say and where to fly", async () => {
    stubFloki({ replies: [{ say: "Course set for work.", go: "work" }] });
    const { result } = renderFloki();

    let outcome;
    await act(async () => {
      outcome = await result.current.ask("i want to see where he worked");
    });

    expect(outcome).toEqual({
      status: "answered",
      say: "Course set for work.",
      destination: expect.objectContaining({ route: "/work" }),
    });
  });

  it("sends the earlier turns along with a new question", async () => {
    const { fetchStub } = stubFloki({
      replies: [{ say: "Gentrit built me." }, { say: "In Pristina." }],
    });
    const { result } = renderFloki();

    await act(() => result.current.ask("who built you"));
    await act(() => result.current.ask("where"));

    expect(getMessages({ fetchStub, call: 1 }).slice(1)).toEqual([
      { role: "user", content: "who built you" },
      { role: "assistant", content: '{"say":"Gentrit built me."}' },
      { role: "user", content: "where" },
    ]);
  });

  it("says when the comms are down", async () => {
    stubFloki({ replies: [{ status: 500 }] });
    const { result } = renderFloki();

    let outcome;
    await act(async () => {
      outcome = await result.current.ask("hello");
    });

    expect(outcome).toEqual({ status: "failed", reason: "unavailable" });
  });

  it("stops answering after the questions of one visit, but still flies", async () => {
    const { fetchStub } = stubFloki({ replies: [{ say: "Noted." }] });
    const { result } = renderFloki();

    for (let index = 0; index < MAX_QUESTIONS; index += 1) {
      await act(() => result.current.ask(`question ${index}`));
    }
    let outcome;
    await act(async () => {
      outcome = await result.current.ask("one more");
    });

    expect(outcome).toEqual({ status: "failed", reason: "questionLimit" });
    expect(fetchStub).toHaveBeenCalledTimes(MAX_QUESTIONS);
    expect(await result.current.ask("take me to work")).toMatchObject({ status: "navigating" });
  });

  it("works the radio without asking the model", async () => {
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    const fetchStub = vi.fn();
    vi.stubGlobal("fetch", fetchStub);
    const { result } = renderFloki();
    await waitFor(() => expect(players[0]?.paused).toBe(false));

    let outcome;
    await act(async () => {
      outcome = await result.current.ask("next song");
    });
    expect(outcome).toEqual({ status: "radioPlaying", track: TRACKS[1] });
    expect(players[0]?.currentSrc).toBe(TRACKS[1].path);

    await act(async () => {
      outcome = await result.current.ask("stop the music");
    });
    expect(outcome).toEqual({ status: "radioStopped" });

    await act(async () => {
      outcome = await result.current.ask("play the starship avalon");
    });
    expect(outcome).toEqual({ status: "radioPlaying", track: TRACKS[3] });
    expect(players[0]?.currentSrc).toBe(TRACKS[3].path);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("says when the radio has nothing to play", async () => {
    stubAudio({ hasTrack: false, autoplay: "allowed" });
    const { result } = renderFloki();
    await act(async () => {});

    let outcome;
    await act(async () => {
      outcome = await result.current.ask("play");
    });

    expect(outcome).toEqual({ status: "failed", reason: "radioUnavailable" });
  });
});
