import { useState, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type PlaybackStatus = "waiting" | "playing" | "done";

// `progress` runs from 0 to 1 while playing.
type PlaybackSnapshot = { status: PlaybackStatus; progress: number };

const WAITING: PlaybackSnapshot = { status: "waiting", progress: 0 };
const DONE: PlaybackSnapshot = { status: "done", progress: 1 };

// A small store, so the observer and the animation frames live outside render and the element's
// ref callback stays the same function for the element's whole life.
function createPlayback(durationMs: number) {
  let snapshot = WAITING;
  let stopPlaying: (() => void) | undefined;
  const listeners = new Set<() => void>();

  function setSnapshot(next: PlaybackSnapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function play() {
    stopPlaying?.();
    if (durationMs <= 0 || window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      setSnapshot(DONE);
      return;
    }

    const startedAt = performance.now();
    let frame = 0;
    function step() {
      const progress = Math.min(1, (performance.now() - startedAt) / durationMs);
      if (progress === 1) {
        setSnapshot(DONE);
        return;
      }
      setSnapshot({ status: "playing", progress });
      frame = requestAnimationFrame(step);
    }
    step();
    stopPlaying = () => cancelAnimationFrame(frame);
  }

  function observe(element: HTMLElement | null) {
    if (!element || snapshot.status !== "waiting") return;
    if (typeof IntersectionObserver === "undefined") {
      setSnapshot(DONE);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      play();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      stopPlaying?.();
      // Leaving mid-way ends it rather than freezing it half played.
      if (snapshot.status === "playing") setSnapshot(DONE);
    };
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { observe, play, subscribe, getSnapshot: () => snapshot };
}

function getServerSnapshot() {
  return WAITING;
}

// Plays once, over `durationMs`, the first time the element comes on screen, and again on
// `replay`. With reduced motion it ends at once.
export function usePlayOnScreen(durationMs: number) {
  const [playback] = useState(() => createPlayback(durationMs));
  const snapshot = useSyncExternalStore(
    playback.subscribe,
    playback.getSnapshot,
    getServerSnapshot,
  );

  return { ref: playback.observe, replay: playback.play, ...snapshot };
}
