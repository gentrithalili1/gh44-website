import { vi } from "vitest";

const GESTURE_EVENTS = ["pointerdown", "keydown", "click"] as const;

// What the last `stubAudio` left on the document.
let removeListeners = () => {};

export function removeGestureListeners() {
  removeListeners();
}

type AutoplayPolicy = "allowed" | "needs-gesture";

// jsdom plays no audio: a stand-in that finds the track, or not, follows an autoplay policy and
// records what it is told.
export function stubAudio({ hasTrack, autoplay }: { hasTrack: boolean; autoplay: AutoplayPolicy }) {
  const players: FakeAudio[] = [];
  let hasGesture = autoplay === "allowed";
  function handleGesture() {
    hasGesture = true;
  }
  // Registered before the player's own listeners, as the browser grants the gesture first.
  for (const type of GESTURE_EVENTS) document.addEventListener(type, handleGesture);
  removeListeners = () => {
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
