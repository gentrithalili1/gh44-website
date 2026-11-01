import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { fakeFrames, playFor } from "#/test/motion";
import { renderAt } from "#/test/renderAt";

const TRACK = "/audio/stay.mp3";
const PLAY_LABEL = "play s.t.a.y. from interstellar";
const STOP_LABEL = "stop the music";
const GESTURE_EVENTS = ["pointerdown", "keydown", "click"] as const;

// What the last `stubAudio` left on the document.
let removeGestureListeners = () => {};

type AutoplayPolicy = "allowed" | "needs-gesture";

// jsdom plays no audio: a stand-in that finds the track, or not, follows an autoplay policy and
// records what it is told.
function stubAudio({ hasTrack, autoplay }: { hasTrack: boolean; autoplay: AutoplayPolicy }) {
  const players: FakeAudio[] = [];
  let hasGesture = autoplay === "allowed";
  function handleGesture() {
    hasGesture = true;
  }
  // Registered before the player's own listeners, as the browser grants the gesture first.
  for (const type of GESTURE_EVENTS) document.addEventListener(type, handleGesture);
  removeGestureListeners = () => {
    for (const type of GESTURE_EVENTS) document.removeEventListener(type, handleGesture);
  };

  class FakeAudio extends EventTarget {
    volume = 1;
    loop = false;
    preload = "";
    paused = true;
    currentSrc = "";
    play = vi.fn(async () => {
      if (!hasGesture) throw new DOMException("Needs a gesture", "NotAllowedError");
      this.paused = false;
    });
    pause = vi.fn(() => {
      this.paused = true;
    });

    constructor() {
      super();
      players.push(this);
    }

    set src(src: string) {
      this.currentSrc = src;
      queueMicrotask(() => this.dispatchEvent(new Event(hasTrack ? "loadedmetadata" : "error")));
    }
  }

  vi.stubGlobal("Audio", FakeAudio);
  return players;
}

describe("MusicButton", () => {
  afterEach(() => {
    removeGestureListeners();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows no button while the track is missing", async () => {
    stubAudio({ hasTrack: false, autoplay: "allowed" });
    await renderAt("/");
    await act(async () => {});

    expect(screen.queryByRole("button", { name: PLAY_LABEL })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: STOP_LABEL })).not.toBeInTheDocument();
  });

  it("plays the track on load, fading in", async () => {
    fakeFrames();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");

    expect(await screen.findByRole("button", { name: STOP_LABEL })).toBeInTheDocument();
    const [player] = players;
    expect(player?.currentSrc).toBe(TRACK);
    expect(player?.volume).toBe(0);
    playFor(800);
    expect(player?.volume).toBeGreaterThan(0);
    expect(player?.volume).toBeLessThan(0.7);
    playFor(1000);
    expect(player?.volume).toBe(0.7);
  });

  it("plays on the first interaction when the browser blocks autoplay", async () => {
    fakeFrames();
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "needs-gesture" });
    await renderAt("/");

    expect(await screen.findByRole("button", { name: PLAY_LABEL })).toBeInTheDocument();
    expect(players[0]?.paused).toBe(true);

    await user.keyboard("a");

    expect(await screen.findByRole("button", { name: STOP_LABEL })).toBeInTheDocument();
    playFor(1700);
    expect(players[0]?.volume).toBe(0.7);
  });

  it("plays when the first gesture is a press on the play button", async () => {
    const user = userEvent.setup();
    stubAudio({ hasTrack: true, autoplay: "needs-gesture" });
    await renderAt("/");

    const button = await screen.findByRole("button", { name: PLAY_LABEL });
    // A real press: the page settles between pressing the button down and letting it go.
    await user.pointer({ keys: "[MouseLeft>]", target: button });
    await act(async () => {});
    await user.pointer({ keys: "[/MouseLeft]", target: button });

    expect(await screen.findByRole("button", { name: STOP_LABEL })).toBeInTheDocument();
  });

  it("fades out on stop and never starts again by itself", async () => {
    fakeFrames();
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    playFor(1700);

    await user.click(await screen.findByRole("button", { name: STOP_LABEL }));

    const [player] = players;
    expect(player?.paused).toBe(false);
    playFor(700);
    expect(player?.volume).toBe(0);
    expect(player?.paused).toBe(true);

    await user.pointer({ keys: "[MouseLeft]", target: document.body });
    await user.keyboard("a");
    expect(player?.play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: PLAY_LABEL })).toBeInTheDocument();
  });

  it("plays again from the button after a stop", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");

    await user.click(await screen.findByRole("button", { name: STOP_LABEL }));
    await user.click(screen.getByRole("button", { name: PLAY_LABEL }));

    expect(await screen.findByRole("button", { name: STOP_LABEL })).toBeInTheDocument();
    expect(players[0]?.play).toHaveBeenCalledTimes(2);
  });
});
